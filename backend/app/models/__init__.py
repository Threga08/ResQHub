from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, MaintenanceStaff
from .complaint import Complaint
from .emergency import EmergencyAlert
from .history import ComplaintHistory
from .notification import Notification
from .gatepass import GatePass
from .notice import Notice
from .mess import MessMenu, MessFeedback, MessRebate
from .room_asset import Room, RoomAsset
from .fee import FeePayment

__all__ = [
    'db', 
    'User', 
    'MaintenanceStaff', 
    'Complaint', 
    'EmergencyAlert', 
    'ComplaintHistory', 
    'Notification',
    'GatePass',
    'Notice',
    'MessMenu',
    'MessFeedback',
    'MessRebate',
    'Room',
    'RoomAsset',
    'FeePayment'
]
