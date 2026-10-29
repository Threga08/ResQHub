from datetime import datetime
from . import db

class GatePass(db.Model):
    __tablename__ = 'gate_passes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pass_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    pass_type = db.Column(db.String(50), nullable=False, default='Day Outing') # Day Outing, Night Out, Home Leave, Emergency Leave
    destination = db.Column(db.String(200), nullable=False)
    reason = db.Column(db.Text, nullable=False)
    out_time = db.Column(db.DateTime, nullable=False)
    expected_in_time = db.Column(db.DateTime, nullable=False)
    actual_in_time = db.Column(db.DateTime, nullable=True)
    parent_contact = db.Column(db.String(30), nullable=True)
    status = db.Column(db.String(30), nullable=False, default='Pending', index=True) # Pending, Approved, Rejected, Out, Returned
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id], backref='gate_passes')
    approver = db.relationship('User', foreign_keys=[approved_by])

    def to_dict(self):
        return {
            'id': self.id,
            'pass_code': self.pass_code,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'student_email': self.student.email if self.student else '',
            'student_phone': self.student.phone if self.student else '',
            'hostel_block': self.student.hostel_block if self.student else '',
            'room_number': self.student.room_number if self.student else '',
            'pass_type': self.pass_type,
            'destination': self.destination,
            'reason': self.reason,
            'out_time': self.out_time.isoformat() if self.out_time else None,
            'expected_in_time': self.expected_in_time.isoformat() if self.expected_in_time else None,
            'actual_in_time': self.actual_in_time.isoformat() if self.actual_in_time else None,
            'parent_contact': self.parent_contact or '',
            'status': self.status,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'rejection_reason': self.rejection_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
