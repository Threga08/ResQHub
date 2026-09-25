from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, EmergencyAlert
from ..middleware import get_current_user, role_required
from ..services import NotificationService

emergencies_bp = Blueprint('emergencies', __name__, url_prefix='/api/emergencies')

VALID_EMERGENCY_TYPES = {'Medical', 'Fire', 'Security', 'Electrical Hazard', 'Other'}

@emergencies_bp.route('', methods=['POST'])
@role_required('student', 'warden')
def trigger_emergency():
    user = get_current_user()
    data = request.get_json() or {}

    emergency_type = data.get('emergency_type', 'Medical').strip()
    description = data.get('description', '').strip()
    hostel_block = data.get('hostel_block', user.hostel_block or 'Main Hostel').strip()
    room_number = data.get('room_number', user.room_number or 'N/A').strip()

    if emergency_type not in VALID_EMERGENCY_TYPES:
        emergency_type = 'Other'

    try:
        alert = EmergencyAlert(
            student_id=user.id,
            emergency_type=emergency_type,
            description=description,
            hostel_block=hostel_block,
            room_number=room_number,
            status='Alert Sent'
        )
        db.session.add(alert)
        db.session.commit()

        # Send in-app notification to student
        NotificationService.send_notification(
            user_id=user.id,
            title="Emergency Alert Dispatched",
            message=f"Your {emergency_type} emergency alert has been broadcast to hostel authorities. Stay calm; help is responding.",
            notif_type='emergency'
        )

        # Broadcast urgent alert to all wardens
        NotificationService.notify_wardens(
            title=f"URGENT: {emergency_type} Emergency in {hostel_block} - {room_number}",
            message=f"Student {user.name} ({user.phone}) reported {emergency_type}: '{description or 'Immediate assistance requested'}'.",
            notif_type='emergency'
        )

        return jsonify({
            'message': 'Emergency alert sent successfully',
            'alert': alert.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@emergencies_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_emergencies():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized', 'message': 'User not found'}), 401

    alerts = EmergencyAlert.query.filter_by(student_id=user.id).order_by(EmergencyAlert.created_at.desc()).all()
    return jsonify({'emergencies': [a.to_dict() for a in alerts]}), 200


@emergencies_bp.route('/<int:alert_id>', methods=['GET'])
@jwt_required()
def get_emergency_detail(alert_id):
    user = get_current_user()
    alert = EmergencyAlert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Not Found', 'message': 'Emergency alert not found'}), 404

    if user.role == 'student' and alert.student_id != user.id:
        return jsonify({'error': 'Forbidden', 'message': 'Access restricted'}), 403

    return jsonify({'emergency': alert.to_dict()}), 200
