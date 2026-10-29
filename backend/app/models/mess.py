from datetime import datetime
from . import db

class MessMenu(db.Model):
    __tablename__ = 'mess_menus'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    day_of_week = db.Column(db.String(20), nullable=False) # Monday, Tuesday, ... Sunday
    meal_type = db.Column(db.String(30), nullable=False) # Breakfast, Lunch, Snacks, Dinner
    items = db.Column(db.Text, nullable=False) # e.g. "Puri Bhaji, Tea/Coffee, Banana"
    timing = db.Column(db.String(50), nullable=False) # e.g. "07:30 AM - 09:30 AM"

    def to_dict(self):
        return {
            'id': self.id,
            'day_of_week': self.day_of_week,
            'meal_type': self.meal_type,
            'items': self.items,
            'timing': self.timing
        }


class MessFeedback(db.Model):
    __tablename__ = 'mess_feedbacks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    meal_type = db.Column(db.String(30), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1 - 5
    comment = db.Column(db.Text, nullable=True)
    date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    student = db.relationship('User', foreign_keys=[student_id])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Anonymous Student',
            'hostel_block': self.student.hostel_block if self.student else '',
            'meal_type': self.meal_type,
            'rating': self.rating,
            'comment': self.comment or '',
            'date': self.date,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MessRebate(db.Model):
    __tablename__ = 'mess_rebates'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    start_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    end_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='Pending') # Pending, Approved, Rejected
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])
    approver = db.relationship('User', foreign_keys=[approved_by])

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'room_number': self.student.room_number if self.student else '',
            'hostel_block': self.student.hostel_block if self.student else '',
            'start_date': self.start_date,
            'end_date': self.end_date,
            'reason': self.reason,
            'status': self.status,
            'approved_by': self.approved_by,
            'approver_name': self.approver.name if self.approver else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
