from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..models import User

def get_current_user():
    """Helper to fetch the current authenticated User model instance"""
    identity = get_jwt_identity()
    if not identity:
        return None
    # identity can be the user id or stringified user id
    try:
        user_id = int(identity)
        return User.query.get(user_id)
    except (ValueError, TypeError):
        return None

def role_required(*allowed_roles):
    """Decorator ensuring request has valid JWT and user belongs to allowed roles"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Unauthorized', 'message': 'User account not found'}), 401
            
            if user.role not in allowed_roles:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f"Access restricted. Required roles: {', '.join(allowed_roles)}. Your role: {user.role}"
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
