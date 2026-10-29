from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import db, Room, RoomAsset, User
from ..middleware import get_current_user, role_required

rooms_bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')

@rooms_bp.route('', methods=['GET'])
@jwt_required()
def get_rooms():
    block = request.args.get('block')
    query = Room.query
    if block:
        query = query.filter_by(block=block)
    rooms = query.order_by(Room.room_number.asc()).all()
    return jsonify({'rooms': [r.to_dict() for r in rooms]}), 200


@rooms_bp.route('/<string:room_number>/assets', methods=['GET'])
@jwt_required()
def get_room_assets(room_number):
    assets = RoomAsset.query.filter_by(room_number=room_number).order_by(RoomAsset.id.asc()).all()
    
    # If no assets yet recorded for this room, initialize standard template
    if not assets:
        standard_items = [
            'Ceiling Fan & Speed Regulator',
            'Tube Light & Electrical Switches',
            'Study Desk & Ergonomic Chair',
            'Steel Bed Cot & Mattress',
            'Wardrobe & Security Lock',
            'Window Glass & Mosquito Mesh'
        ]
        created_assets = []
        for item in standard_items:
            ra = RoomAsset(room_number=room_number, asset_name=item, condition='Good')
            db.session.add(ra)
            created_assets.append(ra)
        db.session.commit()
        assets = created_assets

    return jsonify({'assets': [a.to_dict() for a in assets]}), 200


@rooms_bp.route('/assets/<int:asset_id>/inspect', methods=['PUT'])
@jwt_required()
def inspect_asset(asset_id):
    asset = RoomAsset.query.get(asset_id)
    if not asset:
        return jsonify({'error': 'Not Found', 'message': 'Asset record not found'}), 404

    data = request.get_json() or {}
    condition = data.get('condition') # 'Good', 'Needs Repair', 'Damaged'
    notes = data.get('notes', '').strip()

    if condition not in ('Good', 'Needs Repair', 'Damaged'):
        return jsonify({'error': 'Bad Request', 'message': 'Condition must be Good, Needs Repair, or Damaged'}), 400

    try:
        asset.condition = condition
        if notes:
            asset.notes = notes
        asset.last_inspected_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Asset status updated', 'asset': asset.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Server Error', 'message': str(e)}), 500
