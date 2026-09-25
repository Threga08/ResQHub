from datetime import datetime
from . import db

class EmergencyAlert(db.Model):
    __tablename__ = 'emergency_alerts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    emergency_type = db.Column(db.String(50), nullable=False) # Medical, Fire, Security, Electrical Hazard, Other
    description = db.Column(db.Text, nullable=True)
    hostel_block = db.Column(db.String(50), nullable=False)
    room_number = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(30), nullable=False, default='Alert Sent', index=True) # Alert Sent, Acknowledged, Response in Progress, Resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'student_email': self.student.email if self.student else '',
            'student_phone': self.student.phone if self.student else '',
            'emergency_type': self.emergency_type,
            'description': self.description or '',
            'hostel_block': self.hostel_block,
            'room_number': self.room_number,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'acknowledged_at': self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
