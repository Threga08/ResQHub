from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, Notice, User
from ..middleware import get_current_user, role_required
from ..services import NotificationService

notices_bp = Blueprint('notices', __name__, url_prefix='/api/notices')

@notices_bp.route('', methods=['GET'])
@jwt_required()
def get_notices():
    category = request.args.get('category')
    query = Notice.query
    if category and category != 'All':
        query = query.filter_by(category=category)

    # Order pinned notices first, then newest
    notices = query.order_by(Notice.is_pinned.desc(), Notice.created_at.desc()).all()
    return jsonify({'notices': [n.to_dict() for n in notices]}), 200


@notices_bp.route('', methods=['POST'])
@role_required('warden')
def create_notice():
    warden = get_current_user()
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    category = data.get('category', 'General').strip()
    priority = data.get('priority', 'Normal').strip()
    is_pinned = bool(data.get('is_pinned', False))

    if not title or not content:
        return jsonify({'error': 'Bad Request', 'message': 'Title and content are required'}), 400

    try:
        notice = Notice(
            title=title,
            content=content,
            category=category,
            priority=priority,
            is_pinned=is_pinned,
            created_by=warden.id
        )
        db.session.add(notice)
        db.session.commit()

        # Send broadcast notification to all students
        students = User.query.filter_by(role='student').all()
        for s in students:
            NotificationService.send_notification(
                user_id=s.id,
                title=f"Notice: {title}",
                message=content[:120] + ('...' if len(content) > 120 else ''),
                notif_type='system'
            )

        return jsonify({
            'message': 'Notice published successfully',
            'notice': notice.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@notices_bp.route('/<int:notice_id>', methods=['DELETE'])
@role_required('warden')
def delete_notice(notice_id):
    notice = Notice.query.get(notice_id)
    if not notice:
        return jsonify({'error': 'Not Found', 'message': 'Notice not found'}), 404

    try:
        db.session.delete(notice)
        db.session.commit()
        return jsonify({'message': 'Notice deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@notices_bp.route('/<int:notice_id>/pin', methods=['PUT'])
@role_required('warden')
def toggle_pin(notice_id):
    notice = Notice.query.get(notice_id)
    if not notice:
        return jsonify({'error': 'Not Found', 'message': 'Notice not found'}), 404

    try:
        notice.is_pinned = not notice.is_pinned
        db.session.commit()
        return jsonify({
            'message': f'Notice {"pinned" if notice.is_pinned else "unpinned"} successfully',
            'notice': notice.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500
