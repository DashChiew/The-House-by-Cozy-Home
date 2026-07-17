from datetime import datetime
from app import db


class AdminUser(db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'username': self.username}


class Property(db.Model):
    __tablename__ = 'properties'
    id = db.Column(db.Integer, primary_key=True)
    name_en = db.Column(db.String(200), nullable=False)
    name_zh = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    description_en = db.Column(db.Text)
    description_zh = db.Column(db.Text)
    phone = db.Column(db.String(30))
    whatsapp = db.Column(db.String(30))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    photos = db.relationship('PropertyPhoto', backref='property', lazy=True, cascade='all, delete-orphan')
    units = db.relationship('Unit', backref='property', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_units=False, include_photos=False):
        data = {
            'id': self.id,
            'name_en': self.name_en,
            'name_zh': self.name_zh,
            'address': self.address,
            'description_en': self.description_en,
            'description_zh': self.description_zh,
            'phone': self.phone,
            'whatsapp': self.whatsapp,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'available_units_count': sum(1 for u in self.units if u.is_available),
            'total_units_count': len(self.units),
            'cover_photo': next(
                (p.photo_url for p in sorted(self.photos, key=lambda x: x.display_order) if p.is_cover),
                next((p.photo_url for p in sorted(self.photos, key=lambda x: x.display_order)), None)
            ),
        }
        if include_photos:
            data['photos'] = [p.to_dict() for p in sorted(self.photos, key=lambda x: x.display_order)]
        if include_units:
            data['units'] = [u.to_dict() for u in self.units]
        return data


class PropertyPhoto(db.Model):
    __tablename__ = 'property_photos'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    photo_url = db.Column(db.String(500), nullable=False)
    is_cover = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'photo_url': self.photo_url,
            'is_cover': self.is_cover,
            'display_order': self.display_order,
        }


class Unit(db.Model):
    __tablename__ = 'units'
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    unit_name = db.Column(db.String(100), nullable=False)
    gender_type = db.Column(db.String(10), default='mixed')  # 'female', 'male', 'mixed'
    stay_type = db.Column(db.String(10), default='both')     # 'short', 'long', 'both'
    is_available = db.Column(db.Boolean, default=True)
    available_from = db.Column(db.Date)
    description_en = db.Column(db.Text)
    description_zh = db.Column(db.Text)
    equipment_en = db.Column(db.JSON, default=list)
    equipment_zh = db.Column(db.JSON, default=list)
    inclusions_en = db.Column(db.JSON, default=list)
    inclusions_zh = db.Column(db.JSON, default=list)
    exclusions_en = db.Column(db.JSON, default=list)
    exclusions_zh = db.Column(db.JSON, default=list)

    rooms = db.relationship('Room', backref='unit', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_rooms=False):
        data = {
            'id': self.id,
            'property_id': self.property_id,
            'property_name_en': self.property.name_en if self.property else '',
            'property_name_zh': self.property.name_zh if self.property else '',
            'unit_name': self.unit_name,
            'gender_type': self.gender_type,
            'stay_type': self.stay_type,
            'is_available': self.is_available,
            'available_from': self.available_from.isoformat() if self.available_from else None,
            'description_en': self.description_en,
            'description_zh': self.description_zh,
            'equipment_en': self.equipment_en or [],
            'equipment_zh': self.equipment_zh or [],
            'inclusions_en': self.inclusions_en or [],
            'inclusions_zh': self.inclusions_zh or [],
            'exclusions_en': self.exclusions_en or [],
            'exclusions_zh': self.exclusions_zh or [],
            'available_rooms_count': sum(1 for r in self.rooms if r.is_available),
            'total_rooms_count': len(self.rooms),
        }
        if include_rooms:
            # We pass the property and unit info down to room dict representation
            rooms_list = []
            for r in self.rooms:
                rd = r.to_dict()
                rd['unit_name'] = self.unit_name
                rd['property_name_en'] = self.property.name_en if self.property else ''
                rd['property_name_zh'] = self.property.name_zh if self.property else ''
                rooms_list.append(rd)
            data['rooms'] = rooms_list
        return data


class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    unit_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)
    room_name = db.Column(db.String(100), nullable=False)
    room_type = db.Column(db.String(20), default='single')  # single, twin, master, suite, other
    is_available = db.Column(db.Boolean, default=True)
    available_from = db.Column(db.Date)
    price_short = db.Column(db.Numeric(10, 2))
    price_long = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(5), default='MYR')
    video_url = db.Column(db.String(500))  # YouTube/Vimeo embed URL or uploaded video URL
    equipment_en = db.Column(db.JSON, default=list)
    equipment_zh = db.Column(db.JSON, default=list)
    inclusions_en = db.Column(db.JSON, default=list)
    inclusions_zh = db.Column(db.JSON, default=list)
    exclusions_en = db.Column(db.JSON, default=list)
    exclusions_zh = db.Column(db.JSON, default=list)

    photos = db.relationship('RoomPhoto', backref='room', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_photos=True):
        data = {
            'id': self.id,
            'unit_id': self.unit_id,
            'unit_name': self.unit.unit_name if self.unit else '',
            'property_name_en': self.unit.property.name_en if self.unit and self.unit.property else '',
            'property_name_zh': self.unit.property.name_zh if self.unit and self.unit.property else '',
            'room_name': self.room_name,
            'room_type': self.room_type,
            'is_available': self.is_available,
            'available_from': self.available_from.isoformat() if self.available_from else None,
            'price_short': float(self.price_short) if self.price_short else None,
            'price_long': float(self.price_long) if self.price_long else None,
            'currency': self.currency,
            'video_url': self.video_url,
            'equipment_en': self.equipment_en or [],
            'equipment_zh': self.equipment_zh or [],
            'inclusions_en': self.inclusions_en or [],
            'inclusions_zh': self.inclusions_zh or [],
            'exclusions_en': self.exclusions_en or [],
            'exclusions_zh': self.exclusions_zh or [],
            'photos': [p.to_dict() for p in sorted(self.photos, key=lambda x: x.display_order)],
            'cover_photo': next(
                (p.photo_url for p in sorted(self.photos, key=lambda x: x.display_order) if p.is_cover),
                next((p.photo_url for p in sorted(self.photos, key=lambda x: x.display_order)), None)
            ),
        }
        return data


class RoomPhoto(db.Model):
    __tablename__ = 'room_photos'
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id'), nullable=False)
    photo_url = db.Column(db.String(500), nullable=False)
    is_cover = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'room_id': self.room_id,
            'photo_url': self.photo_url,
            'is_cover': self.is_cover,
            'display_order': self.display_order,
        }
