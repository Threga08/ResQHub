from .auth import auth_bp
from .complaints import complaints_bp
from .emergencies import emergencies_bp
from .admin import admin_bp
from .staff import staff_bp
from .notifications import notifications_bp
from .gatepasses import gatepasses_bp
from .notices import notices_bp
from .mess import mess_bp
from .rooms import rooms_bp
from .fees import fees_bp

__all__ = [
    'auth_bp', 
    'complaints_bp', 
    'emergencies_bp', 
    'admin_bp', 
    'staff_bp', 
    'notifications_bp',
    'gatepasses_bp',
    'notices_bp',
    'mess_bp',
    'rooms_bp',
    'fees_bp'
]
