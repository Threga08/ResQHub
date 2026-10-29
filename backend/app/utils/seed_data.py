from datetime import datetime, timedelta, date
from ..models import (
    db, User, MaintenanceStaff, Complaint, EmergencyAlert, ComplaintHistory, Notification,
    GatePass, Notice, MessMenu, MessFeedback, MessRebate, Room, RoomAsset, FeePayment
)

def seed_database():
    """Seeds the database with essential demo accounts and realistic sample records across all modules"""
    # Check if user already exists
    need_full_seed = not User.query.first()

    if need_full_seed:
        print("Seeding database with demo users and core records...")

        # 1. Demo Warden / Admin
        warden = User(
            name="Dr. Rajesh Sharma (Chief Warden)",
            email="warden@resqhub.com",
            role="warden",
            phone="+91 98765 43210",
            hostel_block="Admin Block",
            room_number="W-01"
        )
        warden.set_password("Warden@123")
        db.session.add(warden)

        # 2. Demo Maintenance Staff
        staff1 = User(
            name="Ramesh Kumar (Technician)",
            email="staff@resqhub.com",
            role="staff",
            phone="+91 98765 11223",
            hostel_block="Facility Center",
            room_number="FC-12"
        )
        staff1.set_password("Staff@123")
        db.session.add(staff1)

        staff2 = User(
            name="Suresh Verma (Civil & Carpentry)",
            email="suresh.staff@resqhub.com",
            role="staff",
            phone="+91 98765 33445",
            hostel_block="Facility Center",
            room_number="FC-14"
        )
        staff2.set_password("Staff@123")
        db.session.add(staff2)

        # 3. Demo Students
        student1 = User(
            name="Priya Patel",
            email="student@resqhub.com",
            role="student",
            phone="+91 91234 56789",
            hostel_block="Block B",
            room_number="B-204"
        )
        student1.set_password("Student@123")
        db.session.add(student1)

        student2 = User(
            name="Rahul Mehta",
            email="rahul.student@resqhub.com",
            role="student",
            phone="+91 92345 67890",
            hostel_block="Block A",
            room_number="A-108"
        )
        student2.set_password("Student@123")
        db.session.add(student2)

        db.session.flush()

        # Maintenance staff profile specializations
        m_profile1 = MaintenanceStaff(user_id=staff1.id, specialization="Electrical & HVAC")
        m_profile2 = MaintenanceStaff(user_id=staff2.id, specialization="Carpentry & Plumbing")
        db.session.add_all([m_profile1, m_profile2])

        # 4. Realistic Complaints
        c1 = Complaint(
            complaint_id="RH-1001",
            student_id=student1.id,
            category="Electrical",
            title="Ceiling fan regulator sparking and not working",
            description="The ceiling fan speed regulator sparks whenever turned above speed 2. It gives off a burnt plastic odor. Potential electrical hazard.",
            priority="High",
            status="In Progress",
            assigned_to=staff1.id,
            created_at=datetime.utcnow() - timedelta(days=1, hours=4),
            updated_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.session.add(c1)
        db.session.flush()

        # History for c1
        h1 = ComplaintHistory(
            complaint_id=c1.id,
            old_status="Submitted",
            new_status="Acknowledged",
            changed_by=warden.id,
            remarks="Warden reviewed. Electrical team alerted for urgent fix.",
            created_at=datetime.utcnow() - timedelta(days=1, hours=3)
        )
        h2 = ComplaintHistory(
            complaint_id=c1.id,
            old_status="Acknowledged",
            new_status="Assigned",
            changed_by=warden.id,
            remarks="Assigned to Ramesh Kumar (Electrical)",
            created_at=datetime.utcnow() - timedelta(days=1, hours=2)
        )
        h3 = ComplaintHistory(
            complaint_id=c1.id,
            old_status="Assigned",
            new_status="In Progress",
            changed_by=staff1.id,
            remarks="Inspected the switchboard. Procuring replacement regulator from stock.",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.session.add_all([h1, h2, h3])

        c2 = Complaint(
            complaint_id="RH-1002",
            student_id=student1.id,
            category="Plumbing",
            title="Bathroom tap leaking continuously",
            description="Washbasin cold water tap in B-204 is dripping constantly and cannot be tightened fully.",
            priority="Medium",
            status="Submitted",
            created_at=datetime.utcnow() - timedelta(hours=5),
            updated_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add(c2)

        c3 = Complaint(
            complaint_id="RH-1003",
            student_id=student2.id,
            category="Wi-Fi/Internet",
            title="No Wi-Fi signal in room A-108",
            description="The corridor access point went offline last night. Unable to connect to hostel Wi-Fi for academic work.",
            priority="Medium",
            status="Closed",
            assigned_to=staff1.id,
            created_at=datetime.utcnow() - timedelta(days=2),
            updated_at=datetime.utcnow() - timedelta(hours=6),
            resolved_at=datetime.utcnow() - timedelta(hours=6),
            rating=5,
            feedback_notes="Super quick resolution! Wi-Fi speed is back to 100 Mbps.",
            rated_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add(c3)
        db.session.flush()

        h4 = ComplaintHistory(
            complaint_id=c3.id,
            old_status="In Progress",
            new_status="Resolved",
            changed_by=staff1.id,
            remarks="Rebooted floor switch and reset PoE injector. Wi-Fi signal verified active.",
            created_at=datetime.utcnow() - timedelta(hours=6)
        )
        h5 = ComplaintHistory(
            complaint_id=c3.id,
            old_status="Resolved",
            new_status="Closed",
            changed_by=student2.id,
            remarks="Student rated 5/5 stars: Super quick resolution! Wi-Fi speed is back to 100 Mbps.",
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add_all([h4, h5])

        # 5. Realistic Emergency Alerts
        e1 = EmergencyAlert(
            student_id=student1.id,
            emergency_type="Medical",
            description="Severe asthma breathing attack, inhaler exhausted. Urgent medical assistant required at B-204.",
            hostel_block="Block B",
            room_number="B-204",
            status="Response in Progress",
            created_at=datetime.utcnow() - timedelta(minutes=45),
            acknowledged_at=datetime.utcnow() - timedelta(minutes=40)
        )
        e2 = EmergencyAlert(
            student_id=student2.id,
            emergency_type="Electrical Hazard",
            description="Corridor distribution board sparking near room 108.",
            hostel_block="Block A",
            room_number="A-108",
            status="Resolved",
            created_at=datetime.utcnow() - timedelta(days=3),
            acknowledged_at=datetime.utcnow() - timedelta(days=3, minutes=-5),
            resolved_at=datetime.utcnow() - timedelta(days=3, minutes=-30)
        )
        db.session.add_all([e1, e2])

        # 6. Sample in-app notifications
        notif1 = Notification(
            user_id=student1.id,
            title="Status Updated: RH-1001",
            message="Your complaint 'Ceiling fan regulator sparking' is now In Progress by Ramesh Kumar.",
            type="complaint",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        notif2 = Notification(
            user_id=warden.id,
            title="EMERGENCY ALERT: Medical",
            message="Emergency reported by Priya Patel from Block B, Room B-204.",
            type="emergency",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(minutes=45)
        )
        db.session.add_all([notif1, notif2])
        db.session.commit()

    # Retrieve core references
    warden = User.query.filter_by(role='warden').first()
    student1 = User.query.filter_by(email='student@resqhub.com').first()
    student2 = User.query.filter_by(email='rahul.student@resqhub.com').first()

    # 7. Seed Gate Passes if none exist
    if not GatePass.query.first() and student1:
        print("Seeding Gate Passes...")
        gp1 = GatePass(
            pass_code="GP-1042",
            student_id=student1.id,
            pass_type="Day Outing",
            destination="City Center Central Library",
            reason="Research project preparation and reference material study with study group.",
            out_time=datetime.utcnow() + timedelta(hours=2),
            expected_in_time=datetime.utcnow() + timedelta(hours=7),
            parent_contact="+91 98450 12345",
            status="Approved",
            approved_by=warden.id if warden else None,
            created_at=datetime.utcnow() - timedelta(hours=3)
        )
        gp2 = GatePass(
            pass_code="GP-1043",
            student_id=student1.id,
            pass_type="Home Leave",
            destination="Pune (Home Residence)",
            reason="Sister's wedding ceremony and family celebrations.",
            out_time=datetime.utcnow() + timedelta(days=2),
            expected_in_time=datetime.utcnow() + timedelta(days=5),
            parent_contact="+91 98450 12345",
            status="Pending",
            created_at=datetime.utcnow() - timedelta(hours=1)
        )
        if student2:
            gp3 = GatePass(
                pass_code="GP-1039",
                student_id=student2.id,
                pass_type="Night Out",
                destination="Cyber Heights Tech Hackathon",
                reason="Participating in 36-hour inter-college hackathon event.",
                out_time=datetime.utcnow() - timedelta(days=2, hours=8),
                expected_in_time=datetime.utcnow() - timedelta(days=1),
                actual_in_time=datetime.utcnow() - timedelta(days=1, minutes=15),
                parent_contact="+91 94480 67890",
                status="Returned",
                approved_by=warden.id if warden else None,
                created_at=datetime.utcnow() - timedelta(days=3)
            )
            db.session.add(gp3)
        db.session.add_all([gp1, gp2])
        db.session.commit()

    # 8. Seed Notices if none exist
    if not Notice.query.first() and warden:
        print("Seeding Campus Notices...")
        n1 = Notice(
            title="Scheduled Overhead Water Tank Cleaning & Chlorination",
            content="Hostel overhead water storage tanks in Block A and Block B will undergo bi-monthly pressure washing and chlorination on Saturday between 09:00 AM and 01:00 PM. Water supply will remain paused during these hours. Please store sufficient drinking and utility water in advance.",
            category="Maintenance",
            priority="Urgent",
            is_pinned=True,
            created_by=warden.id,
            created_at=datetime.utcnow() - timedelta(hours=12)
        )
        n2 = Notice(
            title="Hostel Night Curfew & Biometric Attendance Timing Update",
            content="Students are reminded that the hostel main gate closes strictly at 09:30 PM. Mandatory biometric facial attendance must be logged at Block B entrance lobby between 09:00 PM and 09:30 PM daily. Students returning late without prior approved Gate Pass will be subject to disciplinary penalty fines.",
            category="Curfew",
            priority="Important",
            is_pinned=True,
            created_by=warden.id,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        n3 = Notice(
            title="Mess Menu Revision & Special Festival Dinner This Sunday",
            content="Following the Student Mess Committee monthly review, South Indian tiffin items have been expanded. Additionally, a special Diwali/Festive multi-course dinner (Paneer Butter Masala, Gulab Jamun, Jeera Rice) will be served this Sunday 07:30 PM onwards.",
            category="Mess",
            priority="Normal",
            is_pinned=False,
            created_by=warden.id,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        n4 = Notice(
            title="Annual Inter-Hostel Badminton & Table Tennis Tournament",
            content="Registrations are open for the annual tournament taking place in the Indoor Sports Complex next weekend. Interested residents can submit team rosters to the sports secretary by Thursday 06:00 PM.",
            category="Event",
            priority="Normal",
            is_pinned=False,
            created_by=warden.id,
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.session.add_all([n1, n2, n3, n4])
        db.session.commit()

    # 9. Seed Mess Menus if none exist
    if not MessMenu.query.first():
        print("Seeding Mess Menus...")
        weekly_schedule = [
            ("Monday", "Breakfast", "Idli Sambar, Coconut Chutney, Bread Butter, Tea / Coffee", "07:30 AM - 09:30 AM"),
            ("Monday", "Lunch", "Chapati, Dal Tadka, Seasonal Mix Veg, Jeera Rice, Curd", "12:30 PM - 02:30 PM"),
            ("Monday", "Snacks", "Veg Samosa with Mint Chutney, Ginger Tea / Milk", "05:00 PM - 06:15 PM"),
            ("Monday", "Dinner", "Phulka Roti, Aloo Gobi Matar, Moong Dal, Steamed Rice, Fruit Custard", "07:30 PM - 09:30 PM"),

            ("Tuesday", "Breakfast", "Aloo Poha, Boiled Eggs / Sprout Salad, Tea / Coffee", "07:30 AM - 09:30 AM"),
            ("Tuesday", "Lunch", "Poori, Chole Masala, Veg Pulao, Boondi Raita, Salad", "12:30 PM - 02:30 PM"),
            ("Tuesday", "Snacks", "Bread Pakora, Sweet & Sour Chutney, Masala Chai", "05:00 PM - 06:15 PM"),
            ("Tuesday", "Dinner", "Tandoori Roti, Paneer Do Pyaza, Yellow Dal Fry, Jeera Rice, Gulab Jamun", "07:30 PM - 09:30 PM"),

            ("Wednesday", "Breakfast", "Masala Dosa, Sambhar, Tomato Chutney, Filter Coffee", "07:30 AM - 09:30 AM"),
            ("Wednesday", "Lunch", "Roti, Rajma Masala, Kashmiri Pulao, Cucumber Salad, Curd", "12:30 PM - 02:30 PM"),
            ("Wednesday", "Snacks", "Veg Sandwich / Biscuits, Hot Tea", "05:00 PM - 06:15 PM"),
            ("Wednesday", "Dinner", "Butter Naan, Kadai Paneer / Chicken Curry (Optional), Dal Makhani, Pulao, Ice Cream", "07:30 PM - 09:30 PM"),

            ("Thursday", "Breakfast", "Methi Thepla, Sweet Curd, Pickle, Tea / Milk", "07:30 AM - 09:30 AM"),
            ("Thursday", "Lunch", "Phulka, Baingan Bharta, Panchratna Dal, Steamed Basmati Rice, Papad", "12:30 PM - 02:30 PM"),
            ("Thursday", "Snacks", "Bhel Puri / Sev Puri, Lemongrass Tea", "05:00 PM - 06:15 PM"),
            ("Thursday", "Dinner", "Roti, Dum Aloo Kashmiri, Chana Dal Fry, Jeera Rice, Kheer", "07:30 PM - 09:30 PM"),

            ("Friday", "Breakfast", "Upma with Coconut Chutney, Banana, Hot Cocoa / Tea", "07:30 AM - 09:30 AM"),
            ("Friday", "Lunch", "Roti, Bhindi Masala, Gujarati Kadhi, Steamed Rice, Roasted Papad", "12:30 PM - 02:30 PM"),
            ("Friday", "Snacks", "Pani Puri / Sweet Corn Chaat, Tea", "05:00 PM - 06:15 PM"),
            ("Friday", "Dinner", "Lachha Paratha, Shahi Paneer, Dal Palak, Peas Pulao, Moong Dal Halwa", "07:30 PM - 09:30 PM"),

            ("Saturday", "Breakfast", "Aloo Paratha, Fresh Butter, Curd, Pickle, Tea", "07:30 AM - 09:30 AM"),
            ("Saturday", "Lunch", "Pav Bhaji (Butter Toasted), Veg Biryani, Raita, Mixed Greens Salad", "12:30 PM - 02:30 PM"),
            ("Saturday", "Snacks", "Kachori with Green Chutney, Tea / Coffee", "05:00 PM - 06:15 PM"),
            ("Saturday", "Dinner", "Roti, Matar Paneer, Mix Dal Tadka, Ghee Rice, Rasgulla", "07:30 PM - 09:30 PM"),

            ("Sunday", "Breakfast", "Chole Bhature, Sweet Lassi, Fresh Cut Fruits", "08:00 AM - 10:00 AM"),
            ("Sunday", "Lunch", "Special Hyderabadi Dum Biryani (Veg/Paneer), Mirchi Ka Salan, Raita, Papad", "12:30 PM - 02:30 PM"),
            ("Sunday", "Snacks", "French Fries / Veg Cutlet, Hot Coffee", "05:00 PM - 06:15 PM"),
            ("Sunday", "Dinner", "Malai Kofta, Butter Kulcha, Dal Bukhara, Pulao, Shahi Tukda", "07:30 PM - 09:30 PM")
        ]
        for day, meal, items, timing in weekly_schedule:
            db.session.add(MessMenu(day_of_week=day, meal_type=meal, items=items, timing=timing))
        db.session.commit()

    # 10. Seed Mess Feedback & Rebate
    if not MessFeedback.query.first() and student1:
        print("Seeding Mess Feedback...")
        today_str = date.today().isoformat()
        yesterday_str = (date.today() - timedelta(days=1)).isoformat()
        f1 = MessFeedback(student_id=student1.id, meal_type="Breakfast", rating=5, comment="Idli was soft and sambar was piping hot! Excellent quality.", date=today_str)
        f2 = MessFeedback(student_id=student1.id, meal_type="Lunch", rating=4, comment="Dal Tadka was flavorful, rotis were soft.", date=yesterday_str)
        if student2:
            f3 = MessFeedback(student_id=student2.id, meal_type="Dinner", rating=5, comment="Paneer gravy was exceptional tonight, generous portions.", date=yesterday_str)
            db.session.add(f3)
        db.session.add_all([f1, f2])

        r1 = MessRebate(
            student_id=student1.id,
            start_date=(date.today() + timedelta(days=3)).isoformat(),
            end_date=(date.today() + timedelta(days=6)).isoformat(),
            reason="Traveling home for sister's wedding.",
            status="Approved",
            approved_by=warden.id if warden else None
        )
        db.session.add(r1)
        db.session.commit()

    # 11. Seed Rooms and Room Assets
    if not Room.query.first():
        print("Seeding Rooms & Asset Checklists...")
        rooms_data = [
            ("Block A", "A-101", 1, 2, "Double Non-AC", "Washroom, Balcony, 2 Desks"),
            ("Block A", "A-102", 1, 2, "Double Non-AC", "Washroom, Balcony, 2 Desks"),
            ("Block A", "A-108", 1, 2, "Double AC", "Attached Washroom, AC, Balcony, 2 Study Desks"),
            ("Block A", "A-201", 2, 3, "Triple", "Balcony, Washroom, 3 Desks"),
            ("Block B", "B-201", 2, 2, "Double Non-AC", "Balcony, Washroom, 2 Desks"),
            ("Block B", "B-202", 2, 2, "Double AC", "AC, Attached Washroom, Balcony"),
            ("Block B", "B-204", 2, 2, "Double AC", "AC, Attached Washroom, 2 Study Desks, Wi-Fi Extender"),
            ("Block B", "B-301", 3, 1, "Single AC", "Single Room with Private Balcony & Bath")
        ]
        for block, num, fl, cap, rtype, amen in rooms_data:
            db.session.add(Room(block=block, room_number=num, floor=fl, capacity=cap, room_type=rtype, amenities=amen))
        db.session.flush()

        # Seed assets for B-204 (student1 room)
        b204_assets = [
            ("Ceiling Fan & Speed Regulator", "Needs Repair", "Regulator sparks above speed 2 (Complaint RH-1001 logged)"),
            ("Tube Light & Electrical Switches", "Good", "Flicker-free white LED installed"),
            ("Study Desk & Ergonomic Chair", "Good", "Desk surface clean, chair wheels smooth"),
            ("Steel Bed Cot & Foam Mattress", "Good", "Sturdy frame, clean orthopaedic mattress"),
            ("Wardrobe & Security Locker", "Good", "2 keys verified with student"),
            ("Window Glass & Mosquito Mesh", "Good", "Mesh intact without tears")
        ]
        for name, cond, notes in b204_assets:
            db.session.add(RoomAsset(room_number="B-204", asset_name=name, condition=cond, notes=notes))

        # Seed assets for A-108 (student2 room)
        a108_assets = [
            ("Ceiling Fan & Speed Regulator", "Good", "Smooth 5-speed operation"),
            ("Tube Light & Electrical Switches", "Good", "Switchboard verified"),
            ("Study Desk & Ergonomic Chair", "Good", "Oak finish desk with drawer lock"),
            ("Steel Bed Cot & Foam Mattress", "Good", "Standard hostel cot"),
            ("Wardrobe & Security Locker", "Good", "Dual locker functioning"),
            ("Air Conditioner 1.5 Ton Split", "Good", "Cooling optimal at 24C")
        ]
        for name, cond, notes in a108_assets:
            db.session.add(RoomAsset(room_number="A-108", asset_name=name, condition=cond, notes=notes))
        db.session.commit()

    # 12. Seed Fees & Payments
    if not FeePayment.query.first() and student1:
        print("Seeding Fee Records & Fines...")
        fee1 = FeePayment(
            receipt_no="REC-70891",
            student_id=student1.id,
            fee_type="Hostel Room Rent (Semester 1)",
            amount=32000.00,
            due_date=(date.today() + timedelta(days=15)).isoformat(),
            status="Pending",
            notes="Semester 1 residential fee for Double AC room."
        )
        fee2 = FeePayment(
            receipt_no="REC-65420",
            student_id=student1.id,
            fee_type="Mess Dues (Monthly)",
            amount=4500.00,
            due_date=(date.today() - timedelta(days=10)).isoformat(),
            paid_at=datetime.utcnow() - timedelta(days=8),
            status="Paid",
            payment_method="UPI",
            transaction_id="TXN-9988221144",
            notes="Paid via Google Pay UPI."
        )
        fee3 = FeePayment(
            receipt_no="REC-72105",
            student_id=student1.id,
            fee_type="Late Entry Fine",
            amount=250.00,
            due_date=(date.today() + timedelta(days=5)).isoformat(),
            status="Pending",
            notes="Logged return at 10:15 PM without prior leave pass approval."
        )
        db.session.add_all([fee1, fee2, fee3])

        if student2:
            fee4 = FeePayment(
                receipt_no="REC-64190",
                student_id=student2.id,
                fee_type="Hostel Room Rent (Semester 1)",
                amount=32000.00,
                due_date=(date.today() - timedelta(days=20)).isoformat(),
                paid_at=datetime.utcnow() - timedelta(days=18),
                status="Paid",
                payment_method="Net Banking",
                transaction_id="TXN-4455667788",
                notes="Online HDFC netbanking transfer."
            )
            db.session.add(fee4)
        db.session.commit()

    print("ResQHub database seeding complete!")
