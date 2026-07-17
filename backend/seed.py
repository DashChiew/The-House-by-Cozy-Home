"""
Seed script: Recreates the DB tables + admin user + rich demo data (with room photos and video links).
Run from: backend/
  python seed.py

⚠️  WARNING: This script DROPS ALL TABLES and ALL DATA before reseeding.
    Only run this if you want to reset to demo data. Do NOT run on production.
"""
import sys
import bcrypt
from datetime import date
from app import create_app, db
from app.models import AdminUser, Property, PropertyPhoto, Unit, Room, RoomPhoto

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

app = create_app()

with app.app_context():
    # ── Safety Guard ─────────────────────────────────────────────────────────────
    print("")
    print("=" * 60)
    print("  ⚠️  WARNING: DESTRUCTIVE OPERATION")
    print("=" * 60)
    print("  This will DELETE ALL TABLES and ALL DATA in the database,")
    print("  then reseed with demo data.")
    print("")
    print("  Your custom properties, units, rooms, and photos will be")
    print("  PERMANENTLY LOST.")
    print("=" * 60)
    confirm = input("  Type 'yes' to confirm and reset, or press Enter to cancel: ").strip().lower()
    if confirm != 'yes':
        print("\n[CANCELLED] No changes made. Your data is safe.")
        sys.exit(0)
    print("")

    # Drop all tables first to apply schema changes (like new video_url in Room)
    db.drop_all()
    db.create_all()
    print("[OK] Schema updated. Tables recreated.")


    # ── Admin User ──────────────────────────────────────────────────────────────
    hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin = AdminUser(username='admin', password_hash=hashed)
    db.session.add(admin)
    db.session.commit()
    print("[OK] Admin user created: admin / admin123")

    # ═══════════════════════════════════════════════════════
    # PROPERTY 1 - Sunrise Co-Living House (Petaling Jaya)
    # ═══════════════════════════════════════════════════════
    prop1 = Property(
        name_en='Sunrise Co-Living House',
        name_zh='日出共居之家',
        address='No. 12, Jalan Bahagia 3, Taman Sejahtera, 47810 Petaling Jaya, Selangor',
        description_en='A bright and modern co-living home in the heart of Petaling Jaya. Walking distance to LRT station, supermarkets and restaurants. Perfect for working professionals and students.',
        description_zh='位于八打灵再也核心地带的明亮现代共居之家。步行可达轻轨站、超市和餐馆，非常适合上班族和学生。',
        phone='+60 12-345 6789',
        whatsapp='60123456789',
        is_active=True,
    )
    db.session.add(prop1)
    db.session.flush()

    # Property 1 Photos
    p1_photos = [
        PropertyPhoto(property_id=prop1.id, photo_url='https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', is_cover=True, display_order=0),
        PropertyPhoto(property_id=prop1.id, photo_url='https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80', is_cover=False, display_order=1),
        PropertyPhoto(property_id=prop1.id, photo_url='https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', is_cover=False, display_order=2),
    ]
    for photo in p1_photos:
        db.session.add(photo)

    # Unit A - Mixed, Both Stay
    unit_a = Unit(
        property_id=prop1.id,
        unit_name='Unit A - Level 2',
        gender_type='mixed',
        stay_type='both',
        is_available=True,
        available_from=date(2025, 8, 1),
        description_en='Spacious unit on level 2 with open living area, shared kitchen and balcony. Air-conditioned throughout.',
        description_zh='二楼宽敞单位，设有开放式客厅、共享厨房和阳台，全区配置冷气。',
        equipment_en=['WiFi (100 Mbps)', 'Air Conditioning (all rooms)', 'Washing Machine', 'Refrigerator', 'Smart TV', 'Kitchen Utensils', 'Microwave', 'Water Dispenser', 'Dining Table & Chairs', 'Sofa'],
        equipment_zh=['WiFi (100 Mbps)', '冷气（全室）', '洗衣机', '冰箱', '智能电视', '厨具', '微波炉', '饮水机', '餐桌椅', '沙发'],
        inclusions_en=['WiFi', 'Water Bill', 'Electricity (up to RM 50/month)', 'Weekly House Cleaning', 'Trash Collection'],
        inclusions_zh=['WiFi', '水费', '电费（每月至 RM 50）', '每周大扫除', '垃圾收集'],
        exclusions_en=['Electricity exceeding RM 50', 'Parking (RM 80/month)', 'Personal laundry detergent', 'Cooking gas'],
        exclusions_zh=['超出 RM 50 的电费', '停车位（RM 80/月）', '个人洗衣剂', '煮食气体'],
    )
    db.session.add(unit_a)
    db.session.flush()

    # Rooms in Unit A
    r_a1 = Room(
        unit_id=unit_a.id, room_name='Room A1 - Single Cozy', room_type='single',
        is_available=True, available_from=date(2025, 8, 1),
        price_short=900, price_long=700, currency='MYR',
        video_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        equipment_en=['Single Bed with Mattress', 'Wardrobe', 'Study Desk & Chair', 'Air Conditioning', 'Window with Curtains'],
        equipment_zh=['单人床连床垫', '衣柜', '书桌及椅子', '冷气', '窗户及窗帘'],
        inclusions_en=['WiFi', 'Water', 'Electricity (shared limit)'],
        inclusions_zh=['WiFi', '水费', '电费（共享限额）'],
        exclusions_en=['Bedsheet & pillow (first set provided)', 'Electricity beyond limit'],
        exclusions_zh=['床单及枕头（首套提供）', '超出限额电费']
    )
    db.session.add(r_a1)
    db.session.flush()
    db.session.add(RoomPhoto(room_id=r_a1.id, photo_url='https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', display_order=0))
    db.session.add(RoomPhoto(room_id=r_a1.id, photo_url='https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', display_order=1))

    r_a2 = Room(
        unit_id=unit_a.id, room_name='Room A2 - Single Deluxe', room_type='single',
        is_available=True, available_from=date(2025, 8, 1),
        price_short=1000, price_long=800, currency='MYR',
        video_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        equipment_en=['Single Bed with Mattress', 'Wardrobe', 'Study Desk & Chair', 'Air Conditioning', 'Private Mini-Fridge', 'Garden View Window'],
        equipment_zh=['单人床连床垫', '衣柜', '书桌及椅子', '冷气', '私人小冰箱', '花园景观窗户'],
        inclusions_en=['WiFi', 'Water', 'Electricity (shared limit)', 'Mini-fridge electricity'],
        inclusions_zh=['WiFi', '水费', '电费（共享限额）', '小冰箱电费'],
        exclusions_en=['Electricity beyond limit', 'Parking'],
        exclusions_zh=['超出限额电费', '停车位']
    )
    db.session.add(r_a2)
    db.session.flush()
    db.session.add(RoomPhoto(room_id=r_a2.id, photo_url='https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', display_order=0))

    r_a3 = Room(
        unit_id=unit_a.id, room_name='Room A3 - Twin Sharing', room_type='twin',
        is_available=True, available_from=date(2025, 8, 15),
        price_short=600, price_long=500, currency='MYR',
        equipment_en=['2x Single Beds', 'Shared Wardrobe', 'Study Desk', 'Air Conditioning', 'Shared Bathroom'],
        equipment_zh=['2张单人床', '共用衣柜', '书桌', '冷气', '共用浴室'],
        inclusions_en=['WiFi', 'Water', 'Electricity (shared limit)'],
        inclusions_zh=['WiFi', '水费', '电费（共享限额）'],
        exclusions_en=['Electricity beyond limit'],
        exclusions_zh=['超出限额电费']
    )
    db.session.add(r_a3)
    db.session.flush()
    db.session.add(RoomPhoto(room_id=r_a3.id, photo_url='https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', display_order=0))

    r_a4 = Room(
        unit_id=unit_a.id, room_name='Room A4 - Master Suite', room_type='master',
        is_available=False, available_from=date(2025, 9, 1),
        price_short=1400, price_long=1100, currency='MYR',
        equipment_en=['Queen Bed with Mattress', 'En-suite Bathroom', 'Walk-in Wardrobe', 'Air Conditioning', 'Smart TV', 'Balcony Access', 'Work Desk'],
        equipment_zh=['双人床连床垫', '独立浴室', '步入式衣柜', '冷气', '智能电视', '阳台通道', '工作桌'],
        inclusions_en=['WiFi', 'Water', 'Electricity (up to RM 80)', 'Weekly Linen Change'],
        inclusions_zh=['WiFi', '水费', '电费（至 RM 80）', '每周换床单'],
        exclusions_en=['Electricity beyond RM 80', 'Parking', 'Laundry service'],
        exclusions_zh=['超出 RM 80 的电费', '停车位', '洗衣服务']
    )
    db.session.add(r_a4)
    db.session.flush()
    db.session.add(RoomPhoto(room_id=r_a4.id, photo_url='https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', display_order=0))
    db.session.add(RoomPhoto(room_id=r_a4.id, photo_url='https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', display_order=1))

    # Unit B - Female Only, Long Stay
    unit_b = Unit(
        property_id=prop1.id,
        unit_name='Unit B - Level 3 (Female Only)',
        gender_type='female',
        stay_type='long',
        is_available=True,
        available_from=date(2025, 8, 1),
        description_en='A safe and comfortable female-only unit on level 3. Equipped with extra security features including keycard access.',
        description_zh='三楼安全舒适的女性专属单位，配备刷卡门禁等额外安全设施。',
        equipment_en=['WiFi (100 Mbps)', 'Air Conditioning', 'Washing Machine', 'Iron & Ironing Board', 'Hair Dryer', 'Refrigerator', 'Microwave', 'CCTV (common areas)', 'Smart Lock'],
        equipment_zh=['WiFi (100 Mbps)', '冷气', '洗衣机', '熨斗及烫衣板', '吹风机', '冰箱', '微波炉', '闭路电视（公共区域）', '智能门锁'],
        inclusions_en=['WiFi', 'Water', 'Electricity (up to RM 60/month)', 'Weekly Cleaning'],
        inclusions_zh=['WiFi', '水费', '电费（每月至 RM 60）', '每周清洁'],
        exclusions_en=['Electricity exceeding RM 60', 'Parking (RM 60/month)', 'Cooking gas'],
        exclusions_zh=['超出 RM 60 的电费', '停车位（RM 60/月）', '煮食气体'],
    )
    db.session.add(unit_b)
    db.session.flush()

    for r_data in [
        dict(room_name='Room B1 - Single Standard', room_type='single', price_long=750),
        dict(room_name='Room B2 - Single Premium', room_type='single', price_long=850),
        dict(room_name='Room B3 - Suite', room_type='suite', price_long=1050),
    ]:
        r = Room(
            unit_id=unit_b.id, room_name=r_data['room_name'], room_type=r_data['room_type'],
            is_available=True, available_from=date(2025, 8, 1),
            price_long=r_data['price_long'], currency='MYR',
            equipment_en=['Single Bed', 'Wardrobe', 'Study Desk', 'Air Conditioning'],
            equipment_zh=['单人床', '衣柜', '书桌', '冷气'],
            inclusions_en=['WiFi', 'Water', 'Electricity (shared)'],
            inclusions_zh=['WiFi', '水费', '电费（共享）'],
            exclusions_en=['Electricity beyond limit'],
            exclusions_zh=['超出限额电费']
        )
        db.session.add(r)
        db.session.flush()
        db.session.add(RoomPhoto(room_id=r.id, photo_url='https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', display_order=0))

    # ═══════════════════════════════════════════════════════
    # PROPERTY 2 - Garden View Residences (Ampang)
    # ═══════════════════════════════════════════════════════
    prop2 = Property(
        name_en='Garden View Residences',
        name_zh='花园景观公寓',
        address='No. 45, Lorong Damai 3, Taman Damai, 68000 Ampang, Selangor',
        description_en='Serene co-living residence surrounded by lush greenery in Ampang. Close to Ampang Park LRT and major malls. A tranquil escape from the city bustle.',
        description_zh='位于安邦、绿意环绕的宁静共居住所，邻近安邦公园轻轨站和大型购物广场，是城市喧嚣中的静谧天地。',
        phone='+60 16-789 0123',
        whatsapp='60167890123',
        is_active=True,
    )
    db.session.add(prop2)
    db.session.flush()

    db.session.add(PropertyPhoto(property_id=prop2.id, photo_url='https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=1200&q=80', is_cover=True, display_order=0))

    # Unit C - Male Only, Short Stay
    unit_c = Unit(
        property_id=prop2.id,
        unit_name='Unit C - Male Zone (Short Stay)',
        gender_type='male',
        stay_type='short',
        is_available=True,
        available_from=date(2025, 7, 15),
        description_en='Ideal for business travellers and interns. Fully furnished male-only unit with flexible short-stay options from 1 week onwards.',
        description_zh='非常适合商务人士和实习生。全配置男性专属单位，提供灵活的短期入住选择，最短一周起。',
        equipment_en=['WiFi (300 Mbps)', 'Air Conditioning', 'Washing Machine & Dryer', 'Smart TV', 'Kitchen Utensils', 'Refrigerator', 'Microwave', 'Gym Access (level 1)'],
        equipment_zh=['WiFi (300 Mbps)', '冷气', '洗衣烘干机', '智能电视', '厨具', '冰箱', '微波炉', '健身房（一楼）'],
        inclusions_en=['WiFi', 'Water', 'Electricity', 'Gym Access', 'Daily Trash Collection'],
        inclusions_zh=['WiFi', '水费', '电费', '健身房使用', '每日垃圾收集'],
        exclusions_en=['Parking (RM 100/month)', 'Personal toiletries', 'Laundry detergent'],
        exclusions_zh=['停车位（RM 100/月）', '个人洗漱用品', '洗衣剂'],
    )
    db.session.add(unit_c)
    db.session.flush()

    for r_data in [
        dict(room_name='Room C1 - Standard Single', price_short=350),
        dict(room_name='Room C2 - Deluxe Single', price_short=420),
    ]:
        r = Room(
            unit_id=unit_c.id, room_name=r_data['room_name'], room_type='single',
            is_available=True, available_from=date(2025, 7, 15),
            price_short=r_data['price_short'], currency='MYR',
            equipment_en=['Single Bed', 'Wardrobe', 'Desk', 'Air Conditioning'],
            equipment_zh=['单人床', '衣柜', '书桌', '冷气'],
            inclusions_en=['WiFi', 'Water', 'Electricity', 'Gym'],
            inclusions_zh=['WiFi', '水费', '电费', '健身房'],
            exclusions_en=['Parking', 'Meals'],
            exclusions_zh=['停车位', '餐食']
        )
        db.session.add(r)
        db.session.flush()
        db.session.add(RoomPhoto(room_id=r.id, photo_url='https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', display_order=0))

    # Unit D - Mixed, Both Stay
    unit_d = Unit(
        property_id=prop2.id,
        unit_name='Unit D - Garden Suite (Mixed)',
        gender_type='mixed',
        stay_type='both',
        is_available=True,
        available_from=date(2025, 8, 1),
        description_en='Premium mixed unit with garden view. Suitable for couples or individual professionals. Enjoy the peaceful garden view from your room.',
        description_zh='优质混合单位，俯瞰花园景色，适合情侣或个人专业人士，享受宁静的花园景观。',
        equipment_en=['WiFi (300 Mbps)', 'Air Conditioning (all rooms)', 'Washing Machine', 'Refrigerator (large)', 'Smart TV', 'Kitchen Utensils', 'Dining Set', 'Garden Access', 'BBQ Corner'],
        equipment_zh=['WiFi (300 Mbps)', '冷气（全室）', '洗衣机', '大冰箱', '智能电视', '厨具', '餐桌椅', '花园通道', 'BBQ区'],
        inclusions_en=['WiFi', 'Water', 'Electricity (up to RM 70/month)', 'Garden Maintenance'],
        inclusions_zh=['WiFi', '水费', '电费（每月至 RM 70）', '花园维护'],
        exclusions_en=['Electricity beyond RM 70', 'Parking (RM 80/month)', 'BBQ equipment (rental available)'],
        exclusions_zh=['超出 RM 70 的电费', '停车位（RM 80/月）', 'BBQ器材（可租用）'],
    )
    db.session.add(unit_d)
    db.session.flush()

    for r_data in [
        dict(room_name='Room D1 - Garden Single', room_type='single', price_short=950, price_long=780),
        dict(room_name='Room D2 - Garden Master', room_type='master', price_short=1500, price_long=1200),
    ]:
        r = Room(
            unit_id=unit_d.id, room_name=r_data['room_name'], room_type=r_data['room_type'],
            is_available=True, available_from=date(2025, 8, 1),
            price_short=r_data['price_short'], price_long=r_data['price_long'], currency='MYR',
            equipment_en=['Bed', 'Wardrobe', 'Study Desk', 'Air Conditioning'],
            equipment_zh=['床', '衣柜', '书桌', '冷气'],
            inclusions_en=['WiFi', 'Water', 'Electricity'],
            inclusions_zh=['WiFi', '水费', '电费'],
            exclusions_en=['Parking'],
            exclusions_zh=['停车位']
        )
        db.session.add(r)
        db.session.flush()
        db.session.add(RoomPhoto(room_id=r.id, photo_url='https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', display_order=0))

    # ═══════════════════════════════════════════════════════
    # PROPERTY 3 - The Loft @ Cheras (Kuala Lumpur)
    # ═══════════════════════════════════════════════════════
    prop3 = Property(
        name_en='The Loft @ Cheras',
        name_zh='茨厂街阁楼公寓',
        address='Unit 8-3, Residensi Cheras, Jalan Cheras, 56100 Cheras, Kuala Lumpur',
        description_en='Modern high-rise co-living loft in the vibrant Cheras area. Minutes from MRT station, Sunway Velocity Mall and KLCC. Perfect for urban professionals.',
        description_zh='位于繁华茨场区的现代高层共居阁楼，数分钟即达地铁站、Sunway Velocity购物广场及吉隆坡双子塔，是都市专业人士的理想居所。',
        phone='+60 11-234 5678',
        whatsapp='60112345678',
        is_active=True,
    )
    db.session.add(prop3)
    db.session.flush()

    db.session.add(PropertyPhoto(property_id=prop3.id, photo_url='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', is_cover=True, display_order=0))

    # Unit E - Mixed, Both Stay
    unit_e = Unit(
        property_id=prop3.id,
        unit_name='Unit E - 18th Floor (City View)',
        gender_type='mixed',
        stay_type='both',
        is_available=True,
        available_from=date(2025, 7, 20),
        description_en='Stunning city view from the 18th floor. Modern open-concept unit with premium finishes and facilities.',
        description_zh='18楼俯瞰迷人城市景观。现代开放式单位，配备优质装修和设施。',
        equipment_en=['WiFi (500 Mbps Fiber)', 'Air Conditioning', 'Washing Machine & Dryer', 'Smart TV (55")', 'Full Kitchen with Hob & Hood', 'Refrigerator', 'Microwave & Oven', 'Coffee Machine', 'Swimming Pool Access', 'Gym Access', '24hr Security & CCTV'],
        equipment_zh=['WiFi (500 Mbps 光纤)', '冷气', '洗衣烘干机', '智能电视（55寸）', '全套厨房含灶具及排油烟机', '冰箱', '微波炉及烤箱', '咖啡机', '游泳池使用权', '健身房使用权', '24小时保安及闭路电视'],
        inclusions_en=['WiFi', 'Water', 'Electricity (up to RM 80/month)', 'Swimming Pool', 'Gym', 'Parcel Collection', 'Monthly Deep Cleaning'],
        inclusions_zh=['WiFi', '水费', '电费（每月至 RM 80）', '游泳池', '健身房', '代收包裹', '每月深层清洁'],
        exclusions_en=['Electricity beyond RM 80', 'Parking (RM 150/month)', 'Visitor parking', 'Cooking gas'],
        exclusions_zh=['超出 RM 80 的电费', '停车位（RM 150/月）', '访客停车位', '煮食气体'],
    )
    db.session.add(unit_e)
    db.session.flush()

    for r_data in [
        dict(room_name='Room E1 - City View Single', room_type='single', price_short=1100, price_long=900),
        dict(room_name='Room E2 - Premium Single', room_type='single', price_short=1250, price_long=1000),
        dict(room_name='Room E3 - Twin Premium', room_type='twin', price_short=750, price_long=620),
        dict(room_name='Room E4 - Sky Master Suite', room_type='suite', price_short=1800, price_long=1500),
    ]:
        r = Room(
            unit_id=unit_e.id, room_name=r_data['room_name'], room_type=r_data['room_type'],
            is_available=True, available_from=date(2025, 7, 20),
            price_short=r_data['price_short'], price_long=r_data['price_long'], currency='MYR',
            video_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            equipment_en=['Bed', 'Wardrobe', 'Desk', 'Air Conditioning'],
            equipment_zh=['床', '衣柜', '书桌', '冷气'],
            inclusions_en=['WiFi', 'Water', 'Electricity', 'Pool & Gym'],
            inclusions_zh=['WiFi', '水费', '电费', '泳池及健身房'],
            exclusions_en=['Parking'],
            exclusions_zh=['停车位']
        )
        db.session.add(r)
        db.session.flush()
        db.session.add(RoomPhoto(room_id=r.id, photo_url='https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', display_order=0))

    db.session.commit()
    print("[OK] Rich demo data inserted with room photos and videos.")

print("[DONE] Seed complete!")
print("       Login: admin / admin123")
