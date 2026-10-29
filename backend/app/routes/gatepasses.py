import random
import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, GatePass, User
from ..middleware import get_current_user, role_required
from ..services import NotificationService

gatepasses_bp = Blueprint('gatepasses', __name__, url_prefix='/api/gatepasses')

def generate_pass_code():
    for _ in range(10):
        code = f"GP-{random.randint(1000, 9999)}"
        if not GatePass.query.filter_by(pass_code=code).first():
            return code
    return f"GP-{int(time.time())}"

@gatepasses_bp.route('', methods=['POST'])
@role_required('student')
def request_gate_pass():
    user = get_current_user()
    data = request.get_json() or {}

    pass_type = data.get('pass_type', 'Day Outing').strip()
    destination = data.get('destination', '').strip()
    reason = data.get('reason', '').strip()
    out_time_str = data.get('out_time', '').strip()
    expected_in_time_str = data.get('expected_in_time', '').strip()
    parent_contact = data.get('parent_contact', '').strip()

    if not destination or not reason or not out_time_str or not expected_in_time_str:
        return jsonify({'error': 'Bad Request', 'message': 'Destination, reason, departure time and expected return time are required'}), 400

    try:
        # Parse ISO timestamps or datetime-local strings
        out_time = datetime.fromisoformat(out_time_str.replace('Z', '+00:00'))
        expected_in_time = datetime.fromisoformat(expected_in_time_str.replace('Z', '+00:00'))
    except Exception:
        # fallback simple strptime for format YYYY-MM-DDTHH:MM
        try:
            out_time = datetime.strptime(out_time_str[:16], '%Y-%m-%dT%H:%M')
            expected_in_time = datetime.strptime(expected_in_time_str[:16], '%Y-%m-%dT%H:%M')
        except Exception as e:
            return jsonify({'error': 'Bad Request', 'message': f'Invalid datetime format: {str(e)}'}), 400

    try:
        pass_code = generate_pass_code()
        gate_pass = GatePass(
            pass_code=pass_code,
            student_id=user.id,
            pass_type=pass_type,
            destination=destination,
            reason=reason,
            out_time=out_time,
            expected_in_time=expected_in_time,
            parent_contact=parent_contact,
            status='Pending'
        )
        db.session.add(gate_pass)
        db.session.commit()

        # Notify warden
        NotificationService.notify_wardens(
            title=f"New Gate Pass Request ({pass_code})",
            message=f"{user.name} ({user.room_number}) requested {pass_type} to '{destination}'.",
            notif_type='system'
        )

        return jsonify({
            'message': 'Gate pass requested successfully',
            'pass': gate_pass.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@gatepasses_bp.route('/my', methods=['GET'])
@role_required('student')
def get_my_gate_passes():
    user = get_current_user()
    passes = GatePass.query.filter_by(student_id=user.id).order_by(GatePass.created_at.desc()).all()
    return jsonify({'passes': [p.to_dict() for p in passes]}), 200


@gatepasses_bp.route('', methods=['GET'])
@role_required('warden')
def get_all_gate_passes():
    status = request.args.get('status')
    pass_type = request.args.get('pass_type')

    query = GatePass.query
    if status:
        query = query.filter_by(status=status)
    if pass_type:
        query = query.filter_by(pass_type=pass_type)

    passes = query.order_by(GatePass.created_at.desc()).all()
    return jsonify({'passes': [p.to_dict() for p in passes]}), 200


@gatepasses_bp.route('/<int:pass_id>/status', methods=['PUT'])
@role_required('warden')
def update_gate_pass_status(pass_id):
    warden = get_current_user()
    gate_pass = GatePass.query.get(pass_id)
    if not gate_pass:
        return jsonify({'error': 'Not Found', 'message': 'Gate pass not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status') # 'Approved', 'Rejected', 'Out', 'Returned'
    rejection_reason = data.get('rejection_reason', '').strip()

    valid_statuses = {'Pending', 'Approved', 'Rejected', 'Out', 'Returned'}
    if new_status not in valid_statuses:
        return jsonify({'error': 'Bad Request', 'message': f'Invalid status. Allowed: {", ".join(valid_statuses)}'}), 400

    try:
        gate_pass.status = new_status
        if new_status == 'Approved':
            gate_pass.approved_by = warden.id
            gate_pass.rejection_reason = None
        elif new_status == 'Rejected':
            gate_pass.approved_by = warden.id
            gate_pass.rejection_reason = rejection_reason or 'Not approved by warden.'
        elif new_status == 'Returned':
            gate_pass.actual_in_time = datetime.utcnow()

        db.session.commit()

        # Send notification to student
        NotificationService.send_notification(
            user_id=gate_pass.student_id,
            title=f"Gate Pass {gate_pass.pass_code} Status: {new_status}",
            message=f"Your {gate_pass.pass_type} request to {gate_pass.destination} is now {new_status}." + (f" Reason: {rejection_reason}" if rejection_reason else ""),
            notif_type='system'
        )

        return jsonify({
            'message': f'Gate pass status updated to {new_status}',
            'pass': gate_pass.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500
