from datetime import datetime
from . import db

class ComplaintHistory(db.Model):
    __tablename__ = 'complaint_history'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False, index=True)
    old_status = db.Column(db.String(50), nullable=False)
    new_status = db.Column(db.String(50), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to user who made change
    updater = db.relationship('User', foreign_keys=[changed_by])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'old_status': self.old_status,
            'new_status': self.new_status,
            'changed_by': self.changed_by,
            'changed_by_name': self.updater.name if self.updater else 'System',
            'changed_by_role': self.updater.role if self.updater else 'system',
            'remarks': self.remarks or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
