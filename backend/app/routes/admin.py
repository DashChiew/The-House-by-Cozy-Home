import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from datetime import datetime
from app import db
from app.models import Property, PropertyPhoto, Unit, Room, RoomPhoto

admin_bp = Blueprint('admin', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


# ─── PROPERTIES ───────────────────────────────────────────────────────────────

@admin_bp.route('/properties', methods=['GET'])
@jwt_required()
def list_properties():
    props = Property.query.order_by(Property.id).all()
    return jsonify([p.to_dict(include_photos=True) for p in props]), 200


@admin_bp.route('/properties', methods=['POST'])
@jwt_required()
def create_property():
    data = request.get_json()
    prop = Property(
        name_en=data.get('name_en', ''),
        name_zh=data.get('name_zh', ''),
        address=data.get('address', ''),
        description_en=data.get('description_en', ''),
        description_zh=data.get('description_zh', ''),
        phone=data.get('phone', ''),
        whatsapp=data.get('whatsapp', ''),
        is_active=data.get('is_active', True),
    )
    db.session.add(prop)
    db.session.commit()
    return jsonify(prop.to_dict()), 201


@admin_bp.route('/properties/<int:prop_id>', methods=['PUT'])
@jwt_required()
def update_property(prop_id):
    prop = Property.query.get_or_404(prop_id)
    data = request.get_json()
    for field in ['name_en', 'name_zh', 'address', 'description_en', 'description_zh',
                  'phone', 'whatsapp', 'is_active']:
        if field in data:
            setattr(prop, field, data[field])
    db.session.commit()
    return jsonify(prop.to_dict(include_photos=True, include_units=True)), 200


@admin_bp.route('/properties/<int:prop_id>', methods=['DELETE'])
@jwt_required()
def delete_property(prop_id):
    prop = Property.query.get_or_404(prop_id)
    db.session.delete(prop)
    db.session.commit()
    return jsonify({'message': 'Property deleted'}), 200


# ─── PHOTOS ───────────────────────────────────────────────────────────────────

@admin_bp.route('/photos/upload/property/<int:prop_id>', methods=['POST'])
@jwt_required()
def upload_property_photo(prop_id):
    prop = Property.query.get_or_404(prop_id)
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['photo']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400

    filename = secure_filename(file.filename)
    save_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'properties', str(prop_id))
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, filename)
    file.save(filepath)

    rel_url = f'/uploads/properties/{prop_id}/{filename}'
    is_cover = request.form.get('is_cover', 'false').lower() == 'true'
    order = int(request.form.get('display_order', len(prop.photos)))

    photo = PropertyPhoto(property_id=prop_id, photo_url=rel_url, is_cover=is_cover, display_order=order)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@admin_bp.route('/photos/property/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_property_photo(photo_id):
    photo = PropertyPhoto.query.get_or_404(photo_id)
    file_path = os.path.join(current_app.root_path, photo.photo_url.lstrip('/'))
    if os.path.exists(file_path):
        os.remove(file_path)
    db.session.delete(photo)
    db.session.commit()
    return jsonify({'message': 'Photo deleted'}), 200


@admin_bp.route('/photos/property/<int:photo_id>/set-cover', methods=['PUT'])
@jwt_required()
def set_property_cover_photo(photo_id):
    photo = PropertyPhoto.query.get_or_404(photo_id)
    # Set all other photos for the same property to is_cover = False
    PropertyPhoto.query.filter_by(property_id=photo.property_id).update({'is_cover': False})
    # Set the selected photo to is_cover = True
    photo.is_cover = True
    db.session.commit()
    return jsonify({'message': 'Cover photo updated'}), 200


@admin_bp.route('/photos/upload/room/<int:room_id>', methods=['POST'])
@jwt_required()
def upload_room_photo(room_id):
    room = Room.query.get_or_404(room_id)
    if 'photo' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['photo']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400

    filename = secure_filename(file.filename)
    save_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'rooms', str(room_id))
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, filename)
    file.save(filepath)

    rel_url = f'/uploads/rooms/{room_id}/{filename}'
    is_cover = request.form.get('is_cover', 'false').lower() == 'true' or len(room.photos) == 0
    order = int(request.form.get('display_order', len(room.photos)))

    photo = RoomPhoto(room_id=room_id, photo_url=rel_url, is_cover=is_cover, display_order=order)
    db.session.add(photo)
    db.session.commit()
    return jsonify(photo.to_dict()), 201


@admin_bp.route('/photos/room/<int:photo_id>/set-cover', methods=['PUT'])
@jwt_required()
def set_room_cover_photo(photo_id):
    photo = RoomPhoto.query.get_or_404(photo_id)
    # Set all other photos for the same room to is_cover = False
    RoomPhoto.query.filter_by(room_id=photo.room_id).update({'is_cover': False})
    # Set the selected photo to is_cover = True
    photo.is_cover = True
    db.session.commit()
    return jsonify({'message': 'Cover photo updated'}), 200


@admin_bp.route('/photos/room/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_room_photo(photo_id):
    photo = RoomPhoto.query.get_or_404(photo_id)
    file_path = os.path.join(current_app.root_path, photo.photo_url.lstrip('/'))
    if os.path.exists(file_path):
        os.remove(file_path)
    db.session.delete(photo)
    db.session.commit()
    return jsonify({'message': 'Photo deleted'}), 200


# ─── VIDEOS ───────────────────────────────────────────────────────────────────

def allowed_video_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'mp4', 'mov', 'avi', 'mkv', 'webm'}


@admin_bp.route('/videos/upload/room/<int:room_id>', methods=['POST'])
@jwt_required()
def upload_room_video(room_id):
    room = Room.query.get_or_404(room_id)
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    file = request.files['video']
    if file.filename == '' or not allowed_video_file(file.filename):
        return jsonify({'error': 'Invalid video file'}), 400

    filename = secure_filename(file.filename)
    save_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'rooms', str(room_id))
    os.makedirs(save_dir, exist_ok=True)
    filepath = os.path.join(save_dir, filename)
    file.save(filepath)

    # Delete previous local video file if it exists and is local
    if room.video_url and room.video_url.startswith('/uploads/'):
        old_path = os.path.join(current_app.root_path, room.video_url.lstrip('/'))
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass

    rel_url = f'/uploads/rooms/{room_id}/{filename}'
    room.video_url = rel_url
    db.session.commit()
    return jsonify({'video_url': rel_url}), 200


@admin_bp.route('/videos/room/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room_video(room_id):
    room = Room.query.get_or_404(room_id)
    if room.video_url and room.video_url.startswith('/uploads/'):
        file_path = os.path.join(current_app.root_path, room.video_url.lstrip('/'))
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
    room.video_url = None
    db.session.commit()
    return jsonify({'message': 'Video deleted'}), 200


# ─── UNITS ────────────────────────────────────────────────────────────────────

@admin_bp.route('/properties/<int:prop_id>/units', methods=['GET'])
@jwt_required()
def list_units(prop_id):
    Property.query.get_or_404(prop_id)
    units = Unit.query.filter_by(property_id=prop_id).all()
    return jsonify([u.to_dict(include_rooms=True) for u in units]), 200


@admin_bp.route('/properties/<int:prop_id>/units', methods=['POST'])
@jwt_required()
def create_unit(prop_id):
    Property.query.get_or_404(prop_id)
    data = request.get_json()
    unit = Unit(
        property_id=prop_id,
        unit_name=data.get('unit_name', ''),
        gender_type=data.get('gender_type', 'mixed'),
        stay_type=data.get('stay_type', 'both'),
        is_available=data.get('is_available', True),
        available_from=parse_date(data.get('available_from')),
        description_en=data.get('description_en', ''),
        description_zh=data.get('description_zh', ''),
        equipment_en=data.get('equipment_en', []),
        equipment_zh=data.get('equipment_zh', []),
        inclusions_en=data.get('inclusions_en', []),
        inclusions_zh=data.get('inclusions_zh', []),
        exclusions_en=data.get('exclusions_en', []),
        exclusions_zh=data.get('exclusions_zh', []),
    )
    db.session.add(unit)
    db.session.commit()
    return jsonify(unit.to_dict()), 201


@admin_bp.route('/units/<int:unit_id>', methods=['PUT'])
@jwt_required()
def update_unit(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    data = request.get_json()
    for field in ['unit_name', 'gender_type', 'stay_type', 'is_available',
                  'description_en', 'description_zh', 'equipment_en', 'equipment_zh',
                  'inclusions_en', 'inclusions_zh', 'exclusions_en', 'exclusions_zh']:
        if field in data:
            setattr(unit, field, data[field])
    
    if 'available_from' in data:
        unit.available_from = parse_date(data['available_from'])
        
    db.session.commit()
    return jsonify(unit.to_dict(include_rooms=True)), 200


@admin_bp.route('/units/<int:unit_id>', methods=['DELETE'])
@jwt_required()
def delete_unit(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    db.session.delete(unit)
    db.session.commit()
    return jsonify({'message': 'Unit deleted'}), 200


# ─── ROOMS ────────────────────────────────────────────────────────────────────

@admin_bp.route('/units/<int:unit_id>/rooms', methods=['GET'])
@jwt_required()
def list_rooms(unit_id):
    Unit.query.get_or_404(unit_id)
    rooms = Room.query.filter_by(unit_id=unit_id).all()
    return jsonify([r.to_dict(include_photos=True) for r in rooms]), 200


@admin_bp.route('/units/<int:unit_id>/rooms', methods=['POST'])
@jwt_required()
def create_room(unit_id):
    Unit.query.get_or_404(unit_id)
    data = request.get_json()
    
    p_short = data.get('price_short')
    p_long = data.get('price_long')
    
    room = Room(
        unit_id=unit_id,
        room_name=data.get('room_name', ''),
        room_type=data.get('room_type', 'single'),
        is_available=data.get('is_available', True),
        available_from=parse_date(data.get('available_from')),
        price_short=float(p_short) if p_short else None,
        price_long=float(p_long) if p_long else None,
        currency=data.get('currency', 'MYR'),
        video_url=None,
        equipment_en=data.get('equipment_en', []),
        equipment_zh=data.get('equipment_zh', []),
        inclusions_en=data.get('inclusions_en', []),
        inclusions_zh=data.get('inclusions_zh', []),
        exclusions_en=data.get('exclusions_en', []),
        exclusions_zh=data.get('exclusions_zh', []),
    )
    db.session.add(room)
    db.session.commit()
    return jsonify(room.to_dict()), 201


@admin_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@jwt_required()
def update_room(room_id):
    room = Room.query.get_or_404(room_id)
    data = request.get_json()
    for field in ['room_name', 'room_type', 'is_available', 'currency',
                  'equipment_en', 'equipment_zh', 'inclusions_en', 'inclusions_zh',
                  'exclusions_en', 'exclusions_zh']:
        if field in data:
            setattr(room, field, data[field])
            
    if 'price_short' in data:
        p_short = data['price_short']
        room.price_short = float(p_short) if p_short else None
    if 'price_long' in data:
        p_long = data['price_long']
        room.price_long = float(p_long) if p_long else None
        
    if 'available_from' in data:
        room.available_from = parse_date(data['available_from'])
        
    db.session.commit()
    return jsonify(room.to_dict(include_photos=True)), 200


@admin_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@jwt_required()
def delete_room(room_id):
    room = Room.query.get_or_404(room_id)
    db.session.delete(room)
    db.session.commit()
    return jsonify({'message': 'Room deleted'}), 200
