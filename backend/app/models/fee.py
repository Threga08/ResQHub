from datetime import datetime
from . import db

class FeePayment(db.Model):
    __tablename__ = 'fee_payments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    receipt_no = db.Column(db.String(30), unique=True, nullable=False, index=True) # e.g. "REC-8921"
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    fee_type = db.Column(db.String(50), nullable=False) # Hostel Rent, Mess Dues, Late Entry Fine, Damage Penalty, Amenities
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.String(20), nullable=False) # YYYY-MM-DD
    paid_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(30), nullable=False, default='Pending') # Pending, Paid, Overdue
    payment_method = db.Column(db.String(50), nullable=True) # UPI, Debit Card, Credit Card, Net Banking, Cash
    transaction_id = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id], backref='fee_records')

    def to_dict(self):
        return {
            'id': self.id,
            'receipt_no': self.receipt_no,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else 'Unknown',
            'room_number': self.student.room_number if self.student else '',
            'hostel_block': self.student.hostel_block if self.student else '',
            'fee_type': self.fee_type,
            'amount': self.amount,
            'due_date': self.due_date,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'status': self.status,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'notes': self.notes or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
