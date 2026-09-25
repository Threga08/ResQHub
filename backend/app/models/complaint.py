from datetime import datetime
from . import db

class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.String(30), unique=True, nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    priority = db.Column(db.String(20), nullable=False, default='Medium') # Low, Medium, High, Emergency
    status = db.Column(db.String(30), nullable=False, default='Submitted', index=True) # Submitted, Acknowledged, Assigned, In Progress, Resolved, Closed
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    history = db.relationship('ComplaintHistory', backref='complaint', lazy='dynamic', cascade='all, delete-orphan', order_by='ComplaintHistory.created_at.desc()')

    def to_dict(self, include_history=False):
        data = {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'student_email': self.student.email if self.student else '',
            'student_phone': self.student.phone if self.student else '',
            'hostel_block': self.student.hostel_block if self.student else '',
            'room_number': self.student.room_number if self.student else '',
            'category': self.category,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'priority': self.priority,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'assigned_staff_name': self.assignee.name if self.assignee else None,
            'assigned_staff_phone': self.assignee.phone if self.assignee else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }
        if include_history:
            data['history'] = [h.to_dict() for h in self.history.all()]
        return data
