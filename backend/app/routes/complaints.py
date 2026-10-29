import random
import time
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, Complaint, ComplaintHistory, User
from ..middleware import get_current_user, role_required
from ..utils import save_uploaded_file
from ..services import NotificationService

complaints_bp = Blueprint('complaints', __name__, url_prefix='/api/complaints')

VALID_CATEGORIES = {'Plumbing', 'Electrical', 'Water', 'Wi-Fi/Internet', 'Furniture', 'Cleaning', 'Other'}
VALID_PRIORITIES = {'Low', 'Medium', 'High', 'Emergency'}

def generate_complaint_id():
    """Generates unique human-readable complaint identifier, e.g. RH-1042"""
    for _ in range(10):
        cid = f"RH-{random.randint(1000, 9999)}"
        if not Complaint.query.filter_by(complaint_id=cid).first():
            return cid
    return f"RH-{int(time.time())}"

@complaints_bp.route('', methods=['POST'])
@role_required('student', 'warden')
def create_complaint():
    user = get_current_user()
    
    # Handle either multipart form or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        category = request.form.get('category', '').strip()
        priority = request.form.get('priority', 'Medium').strip()
        file = request.files.get('image')
    else:
        data = request.get_json() or {}
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', '').strip()
        priority = data.get('priority', 'Medium').strip()
        file = None

    if not title or not description or not category:
        return jsonify({'error': 'Bad Request', 'message': 'Title, description and category are required'}), 400

    if category not in VALID_CATEGORIES:
        return jsonify({'error': 'Bad Request', 'message': f'Invalid category. Allowed: {", ".join(sorted(VALID_CATEGORIES))}'}), 400

    if priority not in VALID_PRIORITIES:
        priority = 'Medium'

    image_url = None
    if file:
        try:
            image_url = save_uploaded_file(file)
        except ValueError as ve:
            return jsonify({'error': 'Bad Request', 'message': str(ve)}), 400
        except Exception as e:
            return jsonify({'error': 'Upload Error', 'message': f'Failed to upload image: {str(e)}'}), 500

    try:
        cid = generate_complaint_id()
        complaint = Complaint(
            complaint_id=cid,
            student_id=user.id,
            category=category,
            title=title,
            description=description,
            image_url=image_url,
            priority=priority,
            status='Submitted'
        )
        db.session.add(complaint)
        db.session.flush()

        # Add initial history event
        history = ComplaintHistory(
            complaint_id=complaint.id,
            old_status='None',
            new_status='Submitted',
            changed_by=user.id,
            remarks='Complaint submitted by student'
        )
        db.session.add(history)
        db.session.commit()

        # Send notifications
        NotificationService.send_notification(
            user_id=user.id,
            title=f"Complaint #{cid} Submitted",
            message=f"Your complaint '{title}' has been submitted successfully.",
            notif_type='complaint'
        )
        NotificationService.notify_wardens(
            title=f"New Complaint #{cid}",
            message=f"Student {user.name} ({user.hostel_block} - {user.room_number}) submitted: '{title}' [{category}]",
            notif_type='complaint'
        )

        return jsonify({
            'message': 'Complaint submitted successfully',
            'complaint': complaint.to_dict(include_history=True)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@complaints_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_complaints():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized', 'message': 'User not found'}), 401

    status_filter = request.args.get('status')
    category_filter = request.args.get('category')

    query = Complaint.query.filter_by(student_id=user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
    if category_filter:
        query = query.filter_by(category=category_filter)

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify({
        'complaints': [c.to_dict(include_history=True) for c in complaints]
    }), 200


@complaints_bp.route('/<int:complaint_id>', methods=['GET'])
@jwt_required()
def get_complaint_detail(complaint_id):
    user = get_current_user()
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Not Found', 'message': 'Complaint not found'}), 404

    # Allow if user is warden, or staff assigned, or the owner student
    if user.role == 'student' and complaint.student_id != user.id:
        return jsonify({'error': 'Forbidden', 'message': 'Access to this complaint is restricted'}), 403

    return jsonify({'complaint': complaint.to_dict(include_history=True)}), 200


@complaints_bp.route('/<int:complaint_id>/rate', methods=['POST'])
@role_required('student')
def rate_complaint(complaint_id):
    user = get_current_user()
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Not Found', 'message': 'Complaint not found'}), 404

    if complaint.student_id != user.id:
        return jsonify({'error': 'Forbidden', 'message': 'You can only rate your own complaints'}), 403

    if complaint.status not in ('Resolved', 'Closed'):
        return jsonify({'error': 'Bad Request', 'message': 'Only resolved complaints can be rated and closed'}), 400

    data = request.get_json() or {}
    rating = data.get('rating')
    feedback_notes = data.get('feedback_notes', '').strip()

    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'Bad Request', 'message': 'Rating must be an integer between 1 and 5'}), 400

    try:
        old_status = complaint.status
        complaint.rating = rating
        complaint.feedback_notes = feedback_notes
        complaint.rated_at = datetime.utcnow()
        complaint.status = 'Closed'

        history = ComplaintHistory(
            complaint_id=complaint.id,
            old_status=old_status,
            new_status='Closed',
            changed_by=user.id,
            remarks=f"Student rated {rating}/5 stars. Feedback: '{feedback_notes or 'No additional remarks'}'"
        )
        db.session.add(history)
        db.session.commit()

        if complaint.assigned_to:
            NotificationService.send_notification(
                user_id=complaint.assigned_to,
                title="Service Feedback Received",
                message=f"Student rated your resolution for #{complaint.complaint_id} with {rating} stars.",
                notif_type='complaint'
            )

        return jsonify({
            'message': 'Complaint rated and closed successfully',
            'complaint': complaint.to_dict(include_history=True)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500

