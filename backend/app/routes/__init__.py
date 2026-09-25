from .auth import auth_bp
from .complaints import complaints_bp
from .emergencies import emergencies_bp
from .admin import admin_bp
from .staff import staff_bp
from .notifications import notifications_bp

__all__ = ['auth_bp', 'complaints_bp', 'emergencies_bp', 'admin_bp', 'staff_bp', 'notifications_bp']
