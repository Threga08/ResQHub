from datetime import datetime
from . import db

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    block = db.Column(db.String(50), nullable=False) # Block A, Block B
    room_number = db.Column(db.String(30), unique=True, nullable=False, index=True) # e.g. "B-204"
    floor = db.Column(db.Integer, default=1)
    capacity = db.Column(db.Integer, default=2)
    room_type = db.Column(db.String(50), default='Double Non-AC') # Single AC, Double Non-AC, Double AC, Triple
    amenities = db.Column(db.String(255), default='Attached Washroom, Study Desks, Balcony')

    def to_dict(self):
        # Find occupants
        from .user import User
        occupants = User.query.filter_by(room_number=self.room_number, role='student').all()
        return {
            'id': self.id,
            'block': self.block,
            'room_number': self.room_number,
            'floor': self.floor,
            'capacity': self.capacity,
            'occupied_count': len(occupants),
            'room_type': self.room_type,
            'amenities': self.amenities,
            'occupants': [{'id': u.id, 'name': u.name, 'email': u.email, 'phone': u.phone} for u in occupants]
        }


class RoomAsset(db.Model):
    __tablename__ = 'room_assets'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    room_number = db.Column(db.String(30), nullable=False, index=True)
    asset_name = db.Column(db.String(100), nullable=False) # Ceiling Fan, Study Desk, Steel Cot, Wardrobe, Tube Light, Window Mesh
    condition = db.Column(db.String(30), default='Good', nullable=False) # Good, Needs Repair, Damaged
    last_inspected_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'room_number': self.room_number,
            'asset_name': self.asset_name,
            'condition': self.condition,
            'last_inspected_at': self.last_inspected_at.isoformat() if self.last_inspected_at else None,
            'notes': self.notes or ''
        }
