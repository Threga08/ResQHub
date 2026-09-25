from datetime import datetime
from flask import Blueprint, request, jsonify
from ..models import db, Complaint, ComplaintHistory
from ..middleware import get_current_user, role_required
from ..services import NotificationService

staff_bp = Blueprint('staff', __name__, url_prefix='/api/staff')

@staff_bp.route('/complaints', methods=['GET'])
@role_required('staff')
def get_assigned_complaints():
    user = get_current_user()
    status_filter = request.args.get('status')

    query = Complaint.query.filter_by(assigned_to=user.id)
    if status_filter and status_filter != 'all':
        query = query.filter_by(status=status_filter)

    complaints = query.order_by(Complaint.updated_at.desc()).all()
    return jsonify({'complaints': [c.to_dict(include_history=True) for c in complaints]}), 200


@staff_bp.route('/complaints/<int:complaint_id>/status', methods=['PUT'])
@role_required('staff')
def update_status_by_staff(complaint_id):
    user = get_current_user()
    complaint = Complaint.query.get(complaint_id)

    if not complaint:
        return jsonify({'error': 'Not Found', 'message': 'Complaint not found'}), 404

    if complaint.assigned_to != user.id:
        return jsonify({'error': 'Forbidden', 'message': 'You can only update complaints assigned to you'}), 403

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    resolution_notes = data.get('resolution_notes', '').strip()

    valid_transitions = ['In Progress', 'Resolved']
    if new_status not in valid_transitions:
        return jsonify({'error': 'Bad Request', 'message': f'Staff can set status to: {", ".join(valid_transitions)}'}), 400

    old_status = complaint.status
    complaint.status = new_status
    if new_status == 'Resolved' and not complaint.resolved_at:
        complaint.resolved_at = datetime.utcnow()

    history = ComplaintHistory(
        complaint_id=complaint.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=user.id,
        remarks=resolution_notes or f"Status changed to {new_status} by Technician {user.name}"
    )
    db.session.add(history)
    db.session.commit()

    # Notify student
    notif_msg = f"Technician {user.name} updated your complaint #{complaint.complaint_id} to '{new_status}'."
    if resolution_notes:
        notif_msg += f" Note: {resolution_notes}"
    NotificationService.send_notification(
        user_id=complaint.student_id,
        title=f"Complaint #{complaint.complaint_id} {new_status}",
        message=notif_msg,
        notif_type='complaint'
    )

    # Notify wardens
    NotificationService.notify_wardens(
        title=f"Complaint #{complaint.complaint_id} Marked {new_status}",
        message=f"{user.name} set #{complaint.complaint_id} to {new_status}. Notes: {resolution_notes or 'None'}",
        notif_type='complaint'
    )

    return jsonify({
        'message': f'Complaint status successfully updated to {new_status}',
        'complaint': complaint.to_dict(include_history=True)
    }), 200
