from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, MessMenu, MessFeedback, MessRebate, User
from ..middleware import get_current_user, role_required
from ..services import NotificationService

mess_bp = Blueprint('mess', __name__, url_prefix='/api/mess')

@mess_bp.route('/menu', methods=['GET'])
@jwt_required()
def get_menu():
    menus = MessMenu.query.order_by(MessMenu.id.asc()).all()
    return jsonify({'menus': [m.to_dict() for m in menus]}), 200


@mess_bp.route('/menu/<int:menu_id>', methods=['PUT'])
@role_required('warden')
def update_menu_item(menu_id):
    menu = MessMenu.query.get(menu_id)
    if not menu:
        return jsonify({'error': 'Not Found', 'message': 'Menu entry not found'}), 404

    data = request.get_json() or {}
    items = data.get('items', '').strip()
    timing = data.get('timing', '').strip()

    if not items:
        return jsonify({'error': 'Bad Request', 'message': 'Menu items cannot be empty'}), 400

    try:
        menu.items = items
        if timing:
            menu.timing = timing
        db.session.commit()
        return jsonify({'message': 'Menu updated successfully', 'menu': menu.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@mess_bp.route('/feedback', methods=['POST'])
@role_required('student')
def submit_feedback():
    user = get_current_user()
    data = request.get_json() or {}

    meal_type = data.get('meal_type', 'Lunch')
    rating = data.get('rating')
    comment = data.get('comment', '').strip()
    feedback_date = data.get('date', date.today().isoformat())

    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'Bad Request', 'message': 'Rating must be an integer between 1 and 5'}), 400

    try:
        feedback = MessFeedback(
            student_id=user.id,
            meal_type=meal_type,
            rating=rating,
            comment=comment,
            date=feedback_date
        )
        db.session.add(feedback)
        db.session.commit()
        return jsonify({'message': 'Feedback submitted successfully', 'feedback': feedback.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@mess_bp.route('/feedback', methods=['GET'])
@jwt_required()
def get_feedbacks():
    feedbacks = MessFeedback.query.order_by(MessFeedback.created_at.desc()).limit(30).all()
    total = len(feedbacks)
    avg_rating = round(sum(f.rating for f in feedbacks) / total, 1) if total > 0 else 0
    return jsonify({
        'feedbacks': [f.to_dict() for f in feedbacks],
        'average_rating': avg_rating,
        'total_feedbacks': total
    }), 200


@mess_bp.route('/rebate', methods=['POST'])
@role_required('student')
def request_rebate():
    user = get_current_user()
    data = request.get_json() or {}

    start_date = data.get('start_date', '').strip()
    end_date = data.get('end_date', '').strip()
    reason = data.get('reason', '').strip()

    if not start_date or not end_date or not reason:
        return jsonify({'error': 'Bad Request', 'message': 'Start date, end date, and reason are required'}), 400

    try:
        rebate = MessRebate(
            student_id=user.id,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            status='Pending'
        )
        db.session.add(rebate)
        db.session.commit()

        NotificationService.notify_wardens(
            title="New Mess Rebate Request",
            message=f"{user.name} ({user.room_number}) applied for mess rebate from {start_date} to {end_date}.",
            notif_type='system'
        )

        return jsonify({'message': 'Mess rebate request submitted', 'rebate': rebate.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@mess_bp.route('/rebate/my', methods=['GET'])
@role_required('student')
def get_my_rebates():
    user = get_current_user()
    rebates = MessRebate.query.filter_by(student_id=user.id).order_by(MessRebate.created_at.desc()).all()
    return jsonify({'rebates': [r.to_dict() for r in rebates]}), 200


@mess_bp.route('/rebates', methods=['GET'])
@role_required('warden')
def get_all_rebates():
    status = request.args.get('status')
    query = MessRebate.query
    if status:
        query = query.filter_by(status=status)
    rebates = query.order_by(MessRebate.created_at.desc()).all()
    return jsonify({'rebates': [r.to_dict() for r in rebates]}), 200


@mess_bp.route('/rebates/<int:rebate_id>/status', methods=['PUT'])
@role_required('warden')
def update_rebate_status(rebate_id):
    warden = get_current_user()
    rebate = MessRebate.query.get(rebate_id)
    if not rebate:
        return jsonify({'error': 'Not Found', 'message': 'Rebate request not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status') # 'Approved', 'Rejected'
    if new_status not in ('Approved', 'Rejected'):
        return jsonify({'error': 'Bad Request', 'message': 'Status must be Approved or Rejected'}), 400

    try:
        rebate.status = new_status
        rebate.approved_by = warden.id
        db.session.commit()

        NotificationService.send_notification(
            user_id=rebate.student_id,
            title=f"Mess Rebate {new_status}",
            message=f"Your mess rebate request for {rebate.start_date} to {rebate.end_date} has been {new_status}.",
            notif_type='system'
        )

        return jsonify({'message': f'Rebate {new_status}', 'rebate': rebate.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500
