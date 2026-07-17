from flask import Blueprint, jsonify, request
from app.models import Property, Unit, Room

properties_bp = Blueprint('properties', __name__)


@properties_bp.route('/seed-db-once', methods=['GET'])
def seed_db_once():
    # Check if an admin user already exists to prevent accidental re-seeding
    try:
        from app.models import AdminUser
        admin = AdminUser.query.first()
        if admin:
            return jsonify({'message': 'Database is already seeded. Seeding aborted for safety.'}), 400
    except Exception:
        # Table might not exist yet, which is fine
        pass

    import subprocess
    import sys
    import os

    try:
        # Resolve path to seed.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(os.path.dirname(current_dir))
        seed_path = os.path.join(backend_dir, 'seed.py')

        # Run seed.py --force
        result = subprocess.run(
            [sys.executable, seed_path, '--force'],
            capture_output=True,
            text=True,
            check=True
        )
        return jsonify({
            'message': 'Database seeded successfully! You can now login with admin/admin123.',
            'output': result.stdout
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to seed database.',
            'details': str(e),
            'stderr': getattr(e, 'stderr', None)
        }), 500



@properties_bp.route('/properties', methods=['GET'])
def get_properties():
    """List all active properties with summary info."""
    props = Property.query.filter_by(is_active=True).order_by(Property.id).all()
    return jsonify([p.to_dict(include_photos=True) for p in props]), 200


@properties_bp.route('/properties/<int:prop_id>', methods=['GET'])
def get_property(prop_id):
    """Get a single property with all units and photos."""
    prop = Property.query.filter_by(id=prop_id, is_active=True).first_or_404()
    return jsonify(prop.to_dict(include_units=True, include_photos=True)), 200


@properties_bp.route('/units/<int:unit_id>', methods=['GET'])
def get_unit(unit_id):
    """Get a single unit with all rooms (including photos)."""
    unit = Unit.query.get_or_404(unit_id)
    return jsonify(unit.to_dict(include_rooms=True)), 200


@properties_bp.route('/rooms/<int:room_id>', methods=['GET'])
def get_room(room_id):
    """Get a single room with full details, photos and video."""
    room = Room.query.get_or_404(room_id)
    data = room.to_dict()
    # Attach parent info for breadcrumb/contact
    unit = room.unit
    data['unit_name'] = unit.unit_name
    data['unit_id'] = unit.id
    data['property_id'] = unit.property_id
    data['property_name_en'] = unit.property.name_en
    data['property_name_zh'] = unit.property.name_zh
    data['property_phone'] = unit.property.phone
    data['property_whatsapp'] = unit.property.whatsapp
    return jsonify(data), 200


@properties_bp.route('/rooms/search', methods=['GET'])
def search_rooms():
    """Search rooms by name or property name: /api/rooms/search?q=keyword"""
    q = request.args.get('q', '').strip()
    exclude_ids_param = request.args.get('exclude', '')
    try:
        exclude_ids = [int(i) for i in exclude_ids_param.split(',') if i.strip()]
    except ValueError:
        exclude_ids = []

    query = Room.query
    if q:
        like = f'%{q}%'
        query = query.join(Room.unit).join(Unit.property).filter(
            Room.room_name.ilike(like) |
            Unit.unit_name.ilike(like) |
            Property.name_en.ilike(like) |
            Property.name_zh.ilike(like)
        )
    if exclude_ids:
        query = query.filter(~Room.id.in_(exclude_ids))
    rooms = query.limit(10).all()
    result = []
    for r in rooms:
        result.append({
            'id': r.id,
            'room_name': r.room_name,
            'room_type': r.room_type,
            'is_available': r.is_available,
            'unit_name': r.unit.unit_name,
            'unit_id': r.unit.id,
            'property_id': r.unit.property_id,
            'property_name_en': r.unit.property.name_en,
            'property_name_zh': r.unit.property.name_zh,
            'currency': r.currency,
            'price_long': str(r.price_long) if r.price_long else None,
            'price_short': str(r.price_short) if r.price_short else None,
        })
    return jsonify(result), 200


@properties_bp.route('/rooms/compare', methods=['GET'])
def compare_rooms():
    """Compare multiple rooms by IDs: /api/rooms/compare?ids=1,2,3"""
    ids_param = request.args.get('ids', '')
    try:
        ids = [int(i) for i in ids_param.split(',') if i.strip()]
    except ValueError:
        return jsonify({'error': 'Invalid ids'}), 400
    if not ids or len(ids) > 4:
        return jsonify({'error': 'Provide 2-4 room IDs'}), 400
    rooms = Room.query.filter(Room.id.in_(ids)).all()
    result = []
    for r in rooms:
        d = r.to_dict()
        d['unit_name'] = r.unit.unit_name
        d['unit_id'] = r.unit.id
        d['property_id'] = r.unit.property_id
        d['property_name_en'] = r.unit.property.name_en
        d['property_name_zh'] = r.unit.property.name_zh
        result.append(d)
    return jsonify(result), 200


@properties_bp.route('/properties/<int:prop_id>/photos', methods=['GET'])
def get_property_photos(prop_id):
    """Get all photos for a property."""
    prop = Property.query.get_or_404(prop_id)
    photos = sorted(prop.photos, key=lambda x: x.display_order)
    return jsonify([p.to_dict() for p in photos]), 200
