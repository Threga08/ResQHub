import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Wrench, Clock, Bell, PhoneCall, CheckCircle, ArrowRight, Zap, Flame, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '5rem 1.5rem 4rem',
        background: 'radial-gradient(ellipse at top, rgba(79, 70, 229, 0.18) 0%, rgba(11, 15, 25, 0) 70%)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '860px' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            letterSpacing: '0.04em'
          }}>
            <ShieldAlert size={16} /> SMART HOSTEL SAFETY & FACILITY PLATFORM
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Instant Emergency Response & <br />
            <span style={{ background: 'linear-gradient(135deg, #EF4444 0%, #818CF8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Digital Maintenance Management
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            ResQHub replaces manual complaint registers and chaotic WhatsApp groups with a centralized digital command system. Empowering students, wardens, and maintenance crews with real-time tracking.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link 
                to={user.role === 'warden' ? '/admin' : user.role === 'staff' ? '/staff' : '/student'} 
                className="btn btn-primary"
                style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                  Open Dashboard <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                  Register Student Account
                </Link>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Quick Demo Access Bar */}
      <section style={{ padding: '2rem 1.5rem', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              One-Click Evaluator Demo Access
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Pre-seeded with realistic hostel incidents, pending complaints, and maintenance workflows
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            {/* Student Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #3B82F6' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.05rem' }}>Hostel Student</span>
                  <span className="badge badge-in-progress">Student Role</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Priya Patel • Block B, Room 204
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Email: <code>student@resqhub.com</code> | Pass: <code>Student@123</code>
                </p>
              </div>
              <button 
                onClick={() => handleQuickDemoLogin('student@resqhub.com', 'Student@123', '/student')}
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1.25rem', borderColor: '#3B82F6' }}
              >
                Launch as Student <ArrowRight size={15} />
              </button>
            </div>

            {/* Warden Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #EF4444' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.05rem' }}>Chief Warden / Admin</span>
                  <span className="badge badge-priority-emergency">Warden Role</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Dr. Rajesh Sharma • Admin Command
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Email: <code>warden@resqhub.com</code> | Pass: <code>Warden@123</code>
                </p>
              </div>
              <button 
                onClick={() => handleQuickDemoLogin('warden@resqhub.com', 'Warden@123', '/admin')}
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1.25rem', borderColor: '#EF4444' }}
              >
                Launch as Warden <ArrowRight size={15} />
              </button>
            </div>

            {/* Staff Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #F59E0B' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.05rem' }}>Maintenance Staff</span>
                  <span className="badge badge-acknowledged">Technician</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Ramesh Kumar • Electrical & HVAC
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Email: <code>staff@resqhub.com</code> | Pass: <code>Staff@123</code>
                </p>
              </div>
              <button 
                onClick={() => handleQuickDemoLogin('staff@resqhub.com', 'Staff@123', '/staff')}
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '1.25rem', borderColor: '#F59E0B' }}
              >
                Launch as Staff <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ padding: '4rem 1.5rem', flex: 1 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>
              Complete Lifecycle Hostel Management
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Engineered for rapid response during emergencies and transparent facility issue resolution
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Flame size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                One-Click SOS Emergency Alert
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Immediate dispatch for medical crises, electrical fire hazards, and security breaches with student room coordinates and instant warden notification.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79,70,229,0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Wrench size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                Visual Complaint Tracking
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Submit issues with photo evidence across Electrical, Plumbing, Internet, Furniture, and Cleaning categories. Transparent 6-stage lifecycle progression.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CheckCircle size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                Warden & Staff Coordination
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Wardens prioritize and allocate tasks to specialized staff; technicians update resolution remarks and close tickets with complete audit trail history.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            ResQHub – Smart Hostel Emergency & Maintenance Management System
          </p>
        </div>
      </footer>

    </div>
  );
};
