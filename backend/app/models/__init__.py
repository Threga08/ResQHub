from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, MaintenanceStaff
from .complaint import Complaint
from .emergency import EmergencyAlert
from .history import ComplaintHistory
from .notification import Notification

__all__ = ['db', 'User', 'MaintenanceStaff', 'Complaint', 'EmergencyAlert', 'ComplaintHistory', 'Notification']
