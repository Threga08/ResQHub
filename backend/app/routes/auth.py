from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User, MaintenanceStaff
from ..middleware import get_current_user

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'student').strip().lower()
    phone = data.get('phone', '').strip()
    hostel_block = data.get('hostel_block', '').strip()
    room_number = data.get('room_number', '').strip()
    specialization = data.get('specialization', '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Bad Request', 'message': 'Name, email and password are required'}), 400

    if role not in ['student', 'warden', 'staff']:
        return jsonify({'error': 'Bad Request', 'message': 'Invalid role specified'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Conflict', 'message': 'An account with this email already exists'}), 409

    try:
        user = User(
            name=name,
            email=email,
            role=role,
            phone=phone,
            hostel_block=hostel_block,
            room_number=room_number
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        if role == 'staff':
            staff_profile = MaintenanceStaff(
                user_id=user.id,
                specialization=specialization or 'General Maintenance'
            )
            db.session.add(staff_profile)

        db.session.commit()

        # Generate JWT token upon registration
        token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Bad Request', 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Unauthorized', 'message': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not Found', 'message': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200
