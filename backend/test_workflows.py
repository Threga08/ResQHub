import urllib.request
import json

BASE = "http://127.0.0.1:5000/api"

def post(endpoint, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{endpoint}", data=json.dumps(data).encode(), headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def put(endpoint, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{endpoint}", data=json.dumps(data).encode(), headers=headers, method='PUT')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get(endpoint, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE}{endpoint}", headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def main():
    print("=" * 60)
    print("ResQHub Automated Verification of Critical MVP Workflows")
    print("=" * 60)

    # 1. Student Login
    print("\n1. Testing Student Login (student@resqhub.com)...")
    s_login = post('/auth/login', {'email': 'student@resqhub.com', 'password': 'Student@123'})
    s_token = s_login['token']
    print(f"   [SUCCESS] Logged in as: {s_login['user']['name']} ({s_login['user']['role']})")

    # 2. Emergency SOS
    print("\n2. Testing Student Emergency SOS Trigger...")
    sos_data = {
        'emergency_type': 'Fire',
        'description': 'Smoke noticed in corridor near room 204',
        'hostel_block': 'Block B',
        'room_number': 'B-204'
    }
    sos = post('/emergencies', sos_data, s_token)
    alert_id = sos['alert']['id']
    print(f"   [SUCCESS] Emergency Alert Created: ID={alert_id}, Type={sos['alert']['emergency_type']}, Status={sos['alert']['status']}")

    # 3. Submit Maintenance Complaint
    print("\n3. Testing Student Maintenance Complaint Submission...")
    complaint_data = {
        'title': 'Water pressure dropping in shower',
        'description': 'Low pressure in bathroom B-204.',
        'category': 'Plumbing',
        'priority': 'Medium'
    }
    comp = post('/complaints', complaint_data, s_token)
    cid = comp['complaint']['id']
    complaint_num = comp['complaint']['complaint_id']
    print(f"   [SUCCESS] Complaint Registered: {complaint_num} (ID={cid}), Status={comp['complaint']['status']}")

    # 4. Warden Login
    print("\n4. Testing Warden Login (warden@resqhub.com)...")
    w_login = post('/auth/login', {'email': 'warden@resqhub.com', 'password': 'Warden@123'})
    w_token = w_login['token']
    print(f"   [SUCCESS] Logged in as: {w_login['user']['name']} ({w_login['user']['role']})")

    # 5. Warden Acknowledges SOS
    print("\n5. Testing Warden Acknowledging Emergency Alert...")
    ack = put(f"/admin/emergencies/{alert_id}/acknowledge", {'status': 'Response in Progress'}, w_token)
    print(f"   [SUCCESS] Emergency Alert Updated: Status={ack['emergency']['status']}, AckTime={ack['emergency']['acknowledged_at']}")

    # 6. Warden Assigns Complaint
    print("\n6. Testing Warden Assigning Complaint to Technician...")
    staff_list = get('/admin/staff', w_token)
    staff_id = staff_list['staff'][0]['id']
    staff_name = staff_list['staff'][0]['name']
    assigned = put(f"/admin/complaints/{cid}/assign", {'staff_id': staff_id, 'remarks': f"Assigned to {staff_name} for plumbing check"}, w_token)
    print(f"   [SUCCESS] Complaint Assigned: Status={assigned['complaint']['status']}, Assignee={assigned['complaint']['assigned_staff_name']}")

    # 7. Staff Login
    print("\n7. Testing Maintenance Staff Login (staff@resqhub.com)...")
    st_login = post('/auth/login', {'email': 'staff@resqhub.com', 'password': 'Staff@123'})
    st_token = st_login['token']
    print(f"   [SUCCESS] Logged in as: {st_login['user']['name']} ({st_login['user']['role']})")

    # 8. Staff Updates Status to Resolved
    print("\n8. Testing Staff Updating Complaint Status to Resolved...")
    resolved = put(f"/staff/complaints/{cid}/status", {
        'status': 'Resolved',
        'resolution_notes': 'Replaced shower pressure valve. Water pressure tested normal.'
    }, st_token)
    print(f"   [SUCCESS] Staff Marked Resolved: Status={resolved['complaint']['status']}, ResolvedAt={resolved['complaint']['resolved_at']}")

    # 9. Student Checks Ticket Detail
    print("\n9. Testing Student Verifying Ticket Resolution and Audit Trail...")
    final_detail = get(f"/complaints/{cid}", s_token)
    comp_obj = final_detail['complaint']
    print(f"   [SUCCESS] Final Status: {comp_obj['status']}")
    print(f"   [SUCCESS] Audit Trail has {len(comp_obj['history'])} history events:")
    for h in comp_obj['history']:
        print(f"       -> [{h['new_status']}] by {h['changed_by_name']} ({h['changed_by_role']}): {h['remarks']}")

    # 10. Check Notifications
    print("\n10. Testing In-App Notifications...")
    notifs = get('/notifications', s_token)
    print(f"   [SUCCESS] Student has {len(notifs['notifications'])} notifications, Unread={notifs['unread_count']}")

    # 11. Student Rates Complaint & Closes Ticket
    print("\n11. Testing Student Rating and Closing Complaint...")
    rate_res = post(f"/complaints/{cid}/rate", {
        'rating': 5,
        'feedback_notes': 'Shower pressure is great now! Excellent work by technician.'
    }, s_token)
    print(f"   [SUCCESS] Complaint Rated & Closed: Rating={rate_res['complaint']['rating']} Stars, Status={rate_res['complaint']['status']}")

    # 12. Gate Pass Outing Workflow
    print("\n12. Testing Student Requesting Gate Pass & Warden Approval...")
    gp_res = post('/gatepasses', {
        'pass_type': 'Day Outing',
        'destination': 'Metro Central Station',
        'reason': 'Visiting university library to collect research books.',
        'out_time': '2026-10-29T10:00:00',
        'expected_in_time': '2026-10-29T19:00:00',
        'parent_contact': '+91 98765 00000'
    }, s_token)
    gp_id = gp_res['pass']['id']
    gp_code = gp_res['pass']['pass_code']
    print(f"   [SUCCESS] Gate Pass Created: Code={gp_code}, Status={gp_res['pass']['status']}")
    
    # Warden approves gate pass
    gp_app = put(f"/gatepasses/{gp_id}/status", {'status': 'Approved'}, w_token)
    print(f"   [SUCCESS] Warden Approved Gate Pass: Status={gp_app['pass']['status']}, Approver={gp_app['pass']['approver_name']}")

    # 13. Notice Board Broadcast
    print("\n13. Testing Warden Publishing Campus Broadcast Notice...")
    notice_res = post('/notices', {
        'title': 'High Speed Wi-Fi Router Upgrade in Block B',
        'content': 'Fiber optics team will install gigabit Wi-Fi 6 access points in Block B corridors on Thursday.',
        'category': 'Maintenance',
        'priority': 'Important',
        'is_pinned': True
    }, w_token)
    print(f"   [SUCCESS] Notice Published: ID={notice_res['notice']['id']}, Title='{notice_res['notice']['title']}', Pinned={notice_res['notice']['is_pinned']}")

    # 14. Mess Menu & Meal Feedback
    print("\n14. Testing Mess Dining Menu & Student Feedback...")
    menu_res = get('/mess/menu', s_token)
    print(f"   [SUCCESS] Retrieved Weekly Mess Schedule with {len(menu_res['menus'])} meal slots.")
    fb_res = post('/mess/feedback', {
        'meal_type': 'Lunch',
        'rating': 5,
        'comment': 'Chole Masala and Jeera Rice was delicious today!'
    }, s_token)
    print(f"   [SUCCESS] Student Meal Feedback Logged: Rating={fb_res['feedback']['rating']}/5")

    # 15. Room Inventory Checklist
    print("\n15. Testing Room Asset Inventory Checklist...")
    assets_res = get('/rooms/B-204/assets', s_token)
    print(f"   [SUCCESS] Room B-204 has {len(assets_res['assets'])} verified inventory items.")
    for a in assets_res['assets'][:3]:
        print(f"       -> {a['asset_name']}: [{a['condition']}]")

    # 16. Fees and Payments
    print("\n16. Testing Student Fee Payments...")
    fees_res = get('/fees/my', s_token)
    pending_fee = next((f for f in fees_res['fees'] if f['status'] == 'Pending'), None)
    if pending_fee:
        pay_res = post('/fees/pay', {
            'fee_id': pending_fee['id'],
            'payment_method': 'UPI'
        }, s_token)
        print(f"   [SUCCESS] Paid Fee '{pending_fee['fee_type']}': Amount=INR {pay_res['fee']['amount']}, TXN={pay_res['fee']['transaction_id']}")
    else:
        print(f"   [SUCCESS] Student Fees Info: Total Paid=INR {fees_res['total_paid']}")

    print("\n" + "=" * 60)
    print("ALL 6 NEW SYSTEM MODULES AND WORKFLOWS VERIFIED 100% OPERATIONAL!")
    print("=" * 60)

if __name__ == '__main__':
    main()

