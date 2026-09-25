from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, Notification
from ..middleware import get_current_user

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_user_notifications():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized', 'message': 'User not found'}), 401

    notifications = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200


@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    user = get_current_user()
    notif = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
    if not notif:
        return jsonify({'error': 'Not Found', 'message': 'Notification not found'}), 404

    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read', 'notification': notif.to_dict()}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    user = get_current_user()
    Notification.query.filter_by(user_id=user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
