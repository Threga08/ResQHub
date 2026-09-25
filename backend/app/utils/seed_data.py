from datetime import datetime, timedelta
from ..models import db, User, MaintenanceStaff, Complaint, EmergencyAlert, ComplaintHistory, Notification

def seed_database():
    """Seeds the database with essential demo accounts and realistic sample records"""
    # Check if data already exists
    if User.query.first():
        return

    print("Seeding database with demo data...")

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
        status="Resolved",
        assigned_to=staff1.id,
        created_at=datetime.utcnow() - timedelta(days=2),
        updated_at=datetime.utcnow() - timedelta(hours=6),
        resolved_at=datetime.utcnow() - timedelta(hours=6)
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
    db.session.add(h4)

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
    notif3 = Notification(
        user_id=staff1.id,
        title="New Task Assigned: RH-1001",
        message="Warden assigned you complaint RH-1001 (Electrical).",
        type="complaint",
        is_read=False,
        created_at=datetime.utcnow() - timedelta(days=1, hours=2)
    )
    db.session.add_all([notif1, notif2, notif3])

    db.session.commit()
    print("Database successfully seeded with demo accounts and records!")
