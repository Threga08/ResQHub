from datetime import datetime
from flask import Blueprint, request, jsonify
from ..models import db, User, Complaint, EmergencyAlert, ComplaintHistory, MaintenanceStaff
from ..middleware import get_current_user, role_required
from ..services import NotificationService

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/complaints', methods=['GET'])
@role_required('warden')
def get_all_complaints():
    status = request.args.get('status')
    category = request.args.get('category')
    priority = request.args.get('priority')
    search = request.args.get('search', '').strip()

    query = Complaint.query
    if status and status != 'all':
        query = query.filter_by(status=status)
    if category and category != 'all':
        query = query.filter_by(category=category)
    if priority and priority != 'all':
        query = query.filter_by(priority=priority)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Complaint.title.ilike(search_fmt)) |
            (Complaint.complaint_id.ilike(search_fmt)) |
            (Complaint.description.ilike(search_fmt))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify({'complaints': [c.to_dict(include_history=True) for c in complaints]}), 200


@admin_bp.route('/emergencies', methods=['GET'])
@role_required('warden')
def get_all_emergencies():
    status = request.args.get('status')
    query = EmergencyAlert.query
    if status and status != 'all':
        query = query.filter_by(status=status)
    
    emergencies = query.order_by(EmergencyAlert.created_at.desc()).all()
    return jsonify({'emergencies': [e.to_dict() for e in emergencies]}), 200


@admin_bp.route('/complaints/<int:complaint_id>/status', methods=['PUT'])
@role_required('warden')
def update_complaint_status(complaint_id):
    user = get_current_user()
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Not Found', 'message': 'Complaint not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    remarks = data.get('remarks', '').strip()

    valid_statuses = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Bad Request', 'message': f'Invalid status. Allowed: {", ".join(valid_statuses)}'}), 400

    old_status = complaint.status
    complaint.status = new_status
    if new_status in ['Resolved', 'Closed'] and not complaint.resolved_at:
        complaint.resolved_at = datetime.utcnow()

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user.id,
        remarks=remarks or f"Status changed to {new_status} by Warden {user.name}"
    )
    db.session.add(history)
    db.session.commit()

    # Notify student
    NotificationService.send_notification(
        user_id=complaint.student_id,
        title=f"Complaint #{complaint.complaint_id} Updated",
        message=f"Status changed to '{new_status}'. {remarks}",
        notif_type='complaint'
    )

    return jsonify({
        'message': f'Status updated to {new_status}',
        'complaint': complaint.to_dict(include_history=True)
    }), 200


@admin_bp.route('/complaints/<int:complaint_id>/assign', methods=['PUT'])
@role_required('warden')
def assign_complaint(complaint_id):
    user = get_current_user()
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Not Found', 'message': 'Complaint not found'}), 404

    data = request.get_json() or {}
    staff_id = data.get('staff_id')
    remarks = data.get('remarks', '').strip()

    if not staff_id:
        return jsonify({'error': 'Bad Request', 'message': 'staff_id is required'}), 400

    staff = User.query.filter_by(id=staff_id, role='staff').first()
    if not staff:
        return jsonify({'error': 'Not Found', 'message': 'Assigned staff member not found'}), 404

    old_status = complaint.status
    complaint.assigned_to = staff.id
    if complaint.status in ['Submitted', 'Acknowledged']:
        complaint.status = 'Assigned'

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=complaint.status,
        changed_by=user.id,
        remarks=remarks or f"Assigned to {staff.name} ({staff.staff_profile.specialization if staff.staff_profile else 'Technician'})"
    )
    db.session.add(history)
    db.session.commit()

    # Notify student
    NotificationService.send_notification(
        user_id=complaint.student_id,
        title=f"Complaint #{complaint.complaint_id} Assigned",
        message=f"Your complaint has been assigned to {staff.name}. {remarks}",
        notif_type='complaint'
    )

    # Notify staff
    NotificationService.send_notification(
        user_id=staff.id,
        title=f"New Task Assigned: #{complaint.complaint_id}",
        message=f"You have been assigned complaint '{complaint.title}' ({complaint.student.hostel_block} - {complaint.student.room_number}).",
        notif_type='complaint'
    )

    return jsonify({
        'message': f'Complaint assigned to {staff.name}',
        'complaint': complaint.to_dict(include_history=True)
    }), 200


@admin_bp.route('/emergencies/<int:emergency_id>/acknowledge', methods=['PUT'])
@role_required('warden')
def acknowledge_emergency(emergency_id):
    user = get_current_user()
    alert = EmergencyAlert.query.get(emergency_id)
    if not alert:
        return jsonify({'error': 'Not Found', 'message': 'Emergency alert not found'}), 404

    data = request.get_json() or {}
    status_choice = data.get('status', 'Acknowledged')
    if status_choice not in ['Acknowledged', 'Response in Progress']:
        status_choice = 'Acknowledged'

    alert.status = status_choice
    alert.acknowledged_at = datetime.utcnow()
    db.session.commit()

    # Notify student
    NotificationService.send_notification(
        user_id=alert.student_id,
        title="Emergency Acknowledged",
        message=f"Warden {user.name} has acknowledged your {alert.emergency_type} emergency alert. Help is on the way!",
        notif_type='emergency'
    )

    return jsonify({
        'message': f'Emergency status updated to {status_choice}',
        'emergency': alert.to_dict()
    }), 200


@admin_bp.route('/emergencies/<int:emergency_id>/resolve', methods=['PUT'])
@role_required('warden')
def resolve_emergency(emergency_id):
    user = get_current_user()
    alert = EmergencyAlert.query.get(emergency_id)
    if not alert:
        return jsonify({'error': 'Not Found', 'message': 'Emergency alert not found'}), 404

    alert.status = 'Resolved'
    alert.resolved_at = datetime.utcnow()
    db.session.commit()

    NotificationService.send_notification(
        user_id=alert.student_id,
        title="Emergency Marked Resolved",
        message=f"Your {alert.emergency_type} emergency alert has been marked as resolved by {user.name}.",
        notif_type='emergency'
    )

    return jsonify({
        'message': 'Emergency alert marked resolved',
        'emergency': alert.to_dict()
    }), 200


@admin_bp.route('/students', methods=['GET'])
@role_required('warden')
def get_students():
    students = User.query.filter_by(role='student').order_by(User.name.asc()).all()
    return jsonify({'students': [s.to_dict() for s in students]}), 200


@admin_bp.route('/staff', methods=['GET'])
@role_required('warden')
def get_staff():
    staff_members = User.query.filter_by(role='staff').order_by(User.name.asc()).all()
    return jsonify({'staff': [s.to_dict() for s in staff_members]}), 200


@admin_bp.route('/analytics', methods=['GET'])
@role_required('warden')
def get_analytics():
    total_complaints = Complaint.query.count()
    pending_complaints = Complaint.query.filter(Complaint.status.in_(['Submitted', 'Acknowledged'])).count()
    in_progress_complaints = Complaint.query.filter(Complaint.status.in_(['Assigned', 'In Progress'])).count()
    resolved_complaints = Complaint.query.filter(Complaint.status.in_(['Resolved', 'Closed'])).count()

    active_emergencies = EmergencyAlert.query.filter(EmergencyAlert.status.in_(['Alert Sent', 'Acknowledged', 'Response in Progress'])).count()
    total_emergencies = EmergencyAlert.query.count()

    # Category breakdown
    categories = ['Plumbing', 'Electrical', 'Water', 'Wi-Fi/Internet', 'Furniture', 'Cleaning', 'Other']
    by_category = {}
    for cat in categories:
        by_category[cat] = Complaint.query.filter_by(category=cat).count()

    # Priority breakdown
    priorities = ['Low', 'Medium', 'High', 'Emergency']
    by_priority = {}
    for prio in priorities:
        by_priority[prio] = Complaint.query.filter_by(priority=prio).count()

    # Status distribution
    statuses = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed']
    by_status = {}
    for st in statuses:
        by_status[st] = Complaint.query.filter_by(status=st).count()

    recent_emergencies = [e.to_dict() for e in EmergencyAlert.query.order_by(EmergencyAlert.created_at.desc()).limit(5).all()]
    recent_complaints = [c.to_dict() for c in Complaint.query.order_by(Complaint.created_at.desc()).limit(5).all()]

    return jsonify({
        'summary': {
            'total_complaints': total_complaints,
            'pending_complaints': pending_complaints,
            'in_progress_complaints': in_progress_complaints,
            'resolved_complaints': resolved_complaints,
            'active_emergencies': active_emergencies,
            'total_emergencies': total_emergencies
        },
        'by_category': by_category,
        'by_priority': by_priority,
        'by_status': by_status,
        'recent_emergencies': recent_emergencies,
        'recent_complaints': recent_complaints
    }), 200
