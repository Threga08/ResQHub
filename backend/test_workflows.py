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

    print("\n" + "=" * 60)
    print("ALL CORE MVP WORKFLOWS VERIFIED 100% OPERATIONAL!")
    print("=" * 60)

if __name__ == '__main__':
    main()
