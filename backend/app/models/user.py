from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student', 'warden', 'staff'
    phone = db.Column(db.String(20), nullable=True)
    hostel_block = db.Column(db.String(50), nullable=True)
    room_number = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaints = db.relationship('Complaint', backref='student', lazy=True, foreign_keys='Complaint.student_id')
    assigned_complaints = db.relationship('Complaint', backref='assignee', lazy=True, foreign_keys='Complaint.assigned_to')
    emergencies = db.relationship('EmergencyAlert', backref='student', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    staff_profile = db.relationship('MaintenanceStaff', backref='user', uselist=False, lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone or '',
            'hostel_block': self.hostel_block or '',
            'room_number': self.room_number or '',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if self.role == 'staff' and self.staff_profile:
            data['specialization'] = self.staff_profile.specialization
        return data


class MaintenanceStaff(db.Model):
    __tablename__ = 'maintenance_staff'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    specialization = db.Column(db.String(100), nullable=False, default='General Maintenance')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'specialization': self.specialization,
            'name': self.user.name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None
        }
