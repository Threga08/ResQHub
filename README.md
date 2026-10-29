# ResQHub – Smart Hostel Emergency & Maintenance Management System

> **Centralized digital command platform replacing manual registers, phone calls, and WhatsApp groups with instant SOS emergency dispatch, digital maintenance tracking, role-based workflows, and full audit transparency.**

---

## 🌟 Executive Summary

**ResQHub** is an enterprise-grade full-stack web application developed for college hostels and university campuses. It unifies three key user ecosystems:
1. **Hostel Students**: Instant One-Click SOS Emergency dispatch, digital maintenance reporting with photo attachments, 5-star service satisfaction rating, digital gate pass application with QR check-in/out, campus notices, and instant fee & fine tracker.
2. **Wardens & Administrators**: Live incident triage board, urgent emergency response acknowledgment, technician allocation, gate pass approval & curfew enforcement, campus notice broadcasting, fee billing & penalty fine dispatch, and facility analytics.
3. **Maintenance Staff / Technicians**: Mobile-friendly work order view, job status progression, and resolution remarks logging.
4. **Theme Switcher**: Instant one-click toggle between White (Light) and Dark modes with persistent browser memory.

---

## 🏗️ System Architecture

```text
resqhub/
├── frontend/                       # Modern React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/             # Reusable UI widgets
│   │   │   ├── Navbar.jsx          # Role-aware navigation with quick module shortcuts
│   │   │   ├── StatusBadge.jsx     # Semantic status & priority indicators
│   │   │   ├── Timeline.jsx        # 6-stage lifecycle stepper and audit trail logger
│   │   │   ├── EmergencyModal.jsx  # SOS confirmation, type selection & immediate dispatch
│   │   │   ├── AssignStaffModal.jsx# Warden allocation of technicians by specialization
│   │   │   ├── UpdateStatusModal.jsx # Staff & Warden status transitions & remarks
│   │   │   └── RateComplaintModal.jsx # Student 5-star rating & review modal
│   │   ├── pages/                  # Page views
│   │   │   ├── LandingPage.jsx     # Hero page with one-click evaluator demo access
│   │   │   ├── LoginPage.jsx       # Authentication with demo credential autofill
│   │   │   ├── RegisterPage.jsx    # Student & staff registration
│   │   │   ├── StudentDashboard.jsx# Student hub with SOS button, service cards, tickets summary
│   │   │   ├── ReportComplaintPage.jsx # Issue creation form with image upload & priority
│   │   │   ├── MyComplaintsPage.jsx# Filterable personal ticket history
│   │   │   ├── ComplaintDetailPage.jsx # Comprehensive view with image, staff details, timeline & rating
│   │   │   ├── EmergencyContactsPage.jsx # 24x7 directory for ambulance, warden, security
│   │   │   ├── AdminDashboard.jsx  # Warden command center with live SOS alerts, metrics & welfare hub
│   │   │   ├── AdminComplaintsPage.jsx # Advanced complaints table with search & assignment
│   │   │   ├── AdminEmergenciesPage.jsx # Dedicated live SOS emergency dispatch board
│   │   │   ├── AdminAnalyticsPage.jsx # Category, SLA velocity & CSAT breakdown charts
│   │   │   ├── StaffDashboard.jsx  # Technician assigned job orders & resolution logs
│   │   │   ├── NotificationsPage.jsx # In-app notification center
│   │   │   ├── GatePassPage.jsx    # Student gate pass request & digital QR pass card
│   │   │   ├── AdminGatePassesPage.jsx # Warden gate pass triage, approval & security exit/entry log
│   │   │   ├── NoticeBoardPage.jsx # Priority campus broadcasts & warden announcement publishing
│   │   │   └── FeeTrackerPage.jsx  # Fee balance, mock digital payments, e-receipts & penalty fines
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Global JWT state & unread notifications counter
│   │   │   └── ThemeContext.jsx    # Light / Dark theme state management
│   │   ├── services/
│   │   │   └── api.js              # Axios HTTP client with JWT Bearer interceptor
│   │   ├── index.css               # Modern dark SaaS design tokens & animations
│   │   ├── App.jsx                 # Role-based protected router configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                        # Modular Flask REST API
│   ├── app/
│   │   ├── models/                 # SQLAlchemy ORM Models
│   │   │   ├── user.py             # User & MaintenanceStaff models with bcrypt hashes
│   │   │   ├── complaint.py        # Complaint model with rating & feedback fields
│   │   │   ├── emergency.py        # EmergencyAlert model with timestamped states
│   │   │   ├── history.py          # ComplaintHistory audit log entries
│   │   │   ├── notification.py     # In-app notifications
│   │   │   ├── gatepass.py         # GatePass model for outing and leave requests
│   │   │   ├── notice.py           # Notice model for pinned broadcasts & category tags
│   │   │   ├── mess.py             # MessMenu, MessFeedback & MessRebate models
│   │   │   ├── room_asset.py       # Room and RoomAsset inventory checklist models
│   │   │   └── fee.py              # FeePayment model for dues, receipts, and penalties
│   │   ├── routes/                 # Flask Blueprints
│   │   │   ├── auth.py             # /api/auth (register, login, me)
│   │   │   ├── complaints.py       # /api/complaints (create, my, detail, rate)
│   │   │   ├── emergencies.py      # /api/emergencies (trigger, my, detail)
│   │   │   ├── admin.py            # /api/admin (triage, assign, resolve, analytics, CSAT)
│   │   │   ├── staff.py            # /api/staff (assigned tasks, update status)
│   │   │   ├── notifications.py    # /api/notifications (get all, mark read)
│   │   │   ├── gatepasses.py       # /api/gatepasses (request, my, all, status approval)
│   │   │   ├── notices.py          # /api/notices (get all, create, pin, delete)
│   │   │   ├── mess.py             # /api/mess (menu, feedback, rebate)
│   │   │   ├── rooms.py            # /api/rooms (list, assets checklist, inspect)
│   │   │   └── fees.py             # /api/fees (my dues, pay, all, issue fine)
│   │   ├── middleware/             # Role authorization & JWT decoding decorators
│   │   ├── services/               # NotificationService (in-app + push hook)
│   │   ├── utils/                  # File uploads, validation & database seeding
│   │   └── __init__.py             # Flask App Factory with CORS & DB pre-flight
│   ├── uploads/                    # Local storage for complaint photo evidence
│   ├── config.py                   # Central environment configuration
│   ├── run.py                      # Flask server entry point
│   ├── test_workflows.py           # Automated 16-workflow verification test suite
│   └── requirements.txt
│
├── database/
│   └── schema.sql                  # Production MySQL 8.0 DDL schema with foreign keys
│
├── .env.example                    # Sample environment variables
└── README.md                       # Complete documentation
```

---

## 🔑 Demo Credentials

For quick evaluation, pre-seeded demo accounts are ready out of the box:

| Role | Name | Email | Password | Pre-configured Details |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Priya Patel | `student@resqhub.com` | `Student@123` | Block B, Room B-204, Phone: +91 91234 56789 |
| **Warden / Admin** | Dr. Rajesh Sharma | `warden@resqhub.com` | `Warden@123` | Chief Warden, Admin Command |
| **Maintenance Staff** | Ramesh Kumar | `staff@resqhub.com` | `Staff@123` | Specialization: Electrical & HVAC |
| **Maintenance Staff** | Suresh Verma | `suresh.staff@resqhub.com` | `Staff@123` | Specialization: Carpentry & Plumbing |

*(You can also use the one-click "Launch as Student", "Launch as Warden", or "Launch as Staff" buttons directly from the Landing Page or Login Page).*

---

## ⚡ Key Workflows

### 1. Emergency Alert (SOS) Workflow
1. Student clicks prominent **EMERGENCY SOS** button.
2. Safety confirmation dialog opens requiring selection of category (`Medical`, `Fire`, `Security`, `Electrical Hazard`, `Other`) and confirmation of room location.
3. Upon confirmation, the record is saved with status `Alert Sent`.
4. High-priority in-app notifications are broadcast immediately to all active wardens.
5. Warden views the alert highlighted in red on their Command Dashboard and can:
   - Click **Acknowledge & Respond** (`Response in Progress`).
   - Click **Mark Resolved** once security/medical response is complete.

### 2. Maintenance Complaint Lifecycle
```text
Submitted  ──►  Acknowledged  ──►  Assigned  ──►  In Progress  ──►  Resolved  ──►  Closed
```
1. Student fills out ticket details (Category, Title, Description, Room Number, Priority, Optional Photo).
2. Backend assigns a unique identifier (`RH-XXXX`), records initial audit entry, and notifies wardens.
3. Warden assigns ticket to a specialized technician (`Assigned`).
4. Technician marks work `In Progress` and logs repair steps.
5. Technician marks issue `Resolved` and enters resolution notes.
6. Student inspects the complete history log with timestamps and changer roles.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Axios, Lucide Icons, Vite.
- **Styling**: Tailored Modern Dark SaaS CSS tokens with glassmorphism, pulse animations, and responsive flex/grid layouts.
- **Backend**: Python 3.10+, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, Werkzeug.
- **Database**: MySQL 8.0+ (with automatic pre-flight SQLite fallback so the system runs smoothly out of the box).
- **Security**: Password hashing (`werkzeug.security`), JWT Bearer tokens, role-based authorization guards, file MIME validation.

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher & npm
- (Optional) MySQL Server 8.0+

### Step 1: Database Setup (MySQL)
If you wish to use MySQL:
1. Make sure your MySQL service is running.
2. Execute the schema script:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Update `.env` (or `backend/.env`) with your MySQL credentials:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/resqhub_db
   ```
*(Note: If MySQL credentials are not supplied or the database is unreachable, ResQHub's resilient engine automatically initializes a local `resqhub.db` file so all functionality works without setup friction).*

### Step 2: Backend Setup
1. Open a terminal in the project root:
   ```bash
   # Activate virtual environment
   .\.venv\Scripts\activate   # On Windows
   # source .venv/bin/activate # On Linux/macOS

   # Install dependencies
   pip install -r backend/requirements.txt
   ```
2. Run the Flask server:
   ```bash
   cd backend
   python run.py
   ```
   Backend will start at: `http://127.0.0.1:5000`

### Step 3: Frontend Setup
1. In a separate terminal window:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at `http://127.0.0.1:5173`.

---

## 🧪 Automated Testing

To run the automated end-to-end verification script testing the entire Student SOS, Complaint Submission, Warden Assignment, Staff Resolution, and Audit Trail flow:

```bash
cd backend
python test_workflows.py
```

Expected output:
```text
============================================================
ResQHub Automated Verification of Critical MVP Workflows
============================================================
1. Testing Student Login (student@resqhub.com)... [SUCCESS]
2. Testing Student Emergency SOS Trigger... [SUCCESS]
3. Testing Student Maintenance Complaint Submission... [SUCCESS]
4. Testing Warden Login (warden@resqhub.com)... [SUCCESS]
5. Testing Warden Acknowledging Emergency Alert... [SUCCESS]
6. Testing Warden Assigning Complaint to Technician... [SUCCESS]
7. Testing Maintenance Staff Login (staff@resqhub.com)... [SUCCESS]
8. Testing Staff Updating Complaint Status to Resolved... [SUCCESS]
9. Testing Student Verifying Ticket Resolution... [SUCCESS]
10. Testing In-App Notifications... [SUCCESS]
============================================================
ALL CORE MVP WORKFLOWS VERIFIED 100% OPERATIONAL!
============================================================
```

---

## 📡 REST API Reference

### 🔐 Authentication
- `POST /api/auth/register` — Register a new student or staff account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` — Retrieve currently logged-in user profile.

### 📝 Complaints
- `POST /api/complaints` — Submit a complaint (supports `multipart/form-data` with image file).
- `GET /api/complaints/my` — Fetch student's own complaints (supports `?status=` and `?category=`).
- `GET /api/complaints/<id>` — Get complete complaint details, assigned staff, and timeline history.

### 🚨 Emergency SOS
- `POST /api/emergencies` — Trigger instant SOS alert with coordinates.
- `GET /api/emergencies/my` — Fetch student's own emergency requests.
- `GET /api/emergencies/<id>` — View emergency detail.

### 🛡️ Warden / Admin Operations
- `GET /api/admin/complaints` — List all complaints across blocks with search & filter.
- `GET /api/admin/emergencies` — Real-time list of all emergency calls.
- `PUT /api/admin/complaints/<id>/status` — Update complaint status and log audit remarks.
- `PUT /api/admin/complaints/<id>/assign` — Allocate complaint to specialized technician.
- `PUT /api/admin/emergencies/<id>/acknowledge` — Acknowledge and dispatch emergency team.
- `PUT /api/admin/emergencies/<id>/resolve` — Mark emergency incident resolved.
- `GET /api/admin/staff` — List available maintenance staff and specializations.
- `GET /api/admin/students` — List enrolled hostel students.
- `GET /api/admin/analytics` — Summary statistics, category and priority distributions.

### 🔧 Maintenance Staff Operations
- `GET /api/staff/complaints` — List work orders assigned to current technician.
- `PUT /api/staff/complaints/<id>/status` — Transition status (`In Progress`, `Resolved`) and attach resolution notes.

### 🔔 In-App Notifications
- `GET /api/notifications` — Fetch user's notification list and unread count.
- `PUT /api/notifications/<id>/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.

---

## 🔒 Security & Best Practices

1. **Password Hashing**: Passwords are never stored in plaintext; salted and hashed via `werkzeug.security`.
2. **JWT Authorization**: Cryptographically signed JSON Web Tokens for stateless session management with role claims.
3. **Role Guards**: Backend endpoints strictly enforce role authorization via `@role_required()`.
4. **File Upload Hardening**: Secure UUID file renaming, extension whitelisting (`png`, `jpg`, `jpeg`, `webp`), and size limit checks (10MB).
5. **SQL Injection Protection**: SQLAlchemy ORM parametrized query builders eliminate SQL injection risks.
6. **Graceful Degradation**: Dual database engine resilience ensures zero downtime even during database configuration setup.
