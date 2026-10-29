import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Wrench, Clock, CheckCircle2, FileText, 
  ArrowRight, PhoneCall, ShieldAlert, AlertOctagon, PlusCircle, ExternalLink,
  Ticket, Megaphone, Utensils, Home, CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { complaintService, emergencyService } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { EmergencyModal } from '../components/EmergencyModal';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [complaintsRes, emergenciesRes] = await Promise.all([
        complaintService.getMyComplaints(),
        emergencyService.getMyEmergencies()
      ]);
      setComplaints(complaintsRes.data.complaints || []);
      setEmergencies(emergenciesRes.data.emergencies || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeComplaints = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
  const pendingComplaints = complaints.filter(c => c.status === 'Submitted' || c.status === 'Acknowledged');
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Welcome Banner & SOS Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(24, 34, 52, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Hostel Student Portal</span> • <span>{user?.hostel_block || 'Hostel'}</span> • <span>Room {user?.room_number || 'N/A'}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Need facility assistance or facing an urgent situation? Use the options below.
          </p>
        </div>

        {/* SOS Button + Report Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          
          <button 
            onClick={() => setIsEmergencyModalOpen(true)}
            className="btn-sos"
            id="emergency-sos-btn"
          >
            <AlertOctagon size={24} />
            EMERGENCY SOS
          </button>

          <Link to="/report" className="btn btn-primary" style={{ padding: '1rem 1.75rem', fontSize: '1rem' }}>
            <PlusCircle size={20} />
            Report Issue
          </Link>

        </div>
      </div>

      {/* Active Emergency Alert Banner (if any) */}
      {activeEmergencies.length > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid var(--emergency)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--emergency)', color: '#FFFFFF', padding: '0.65rem', borderRadius: '50%' }}>
              <ShieldAlert size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>
                Active SOS Alert: {activeEmergencies[0].emergency_type} ({activeEmergencies[0].status})
              </div>
              <p style={{ fontSize: '0.85rem', color: '#FCA5A5', marginTop: '0.2rem' }}>
                {activeEmergencies[0].description || 'Dispatched to Hostel Warden & Medical response unit.'}
              </p>
            </div>
          </div>
          <span className="badge badge-priority-emergency" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
            {activeEmergencies[0].status}
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Complaints</span>
            <div style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            {activeComplaints.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Currently in progress or assigned
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Review</span>
            <div style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <FileText size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            {pendingComplaints.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Awaiting warden allocation
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolved Issues</span>
            <div style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            {resolvedComplaints.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Completed facility repairs
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Emergency Alerts</span>
            <div style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            {emergencies.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Lifetime SOS calls logged
          </div>
        </div>

      </div>

      {/* Quick Access Portal Modules */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Hostel Services & Resident Hub
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <Link to="/gate-pass" className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Gate Pass</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Digital pass & curfew permission</div>
            </div>
          </Link>

          <Link to="/notices" className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notice Board</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Urgent announcements & alerts</div>
            </div>
          </Link>

          <Link to="/mess" className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Utensils size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Mess & Dining</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekly menu, rating & rebate</div>
            </div>
          </Link>

          <Link to="/rooms" className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Home size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Room & Inventory</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Furniture checklist & inspection</div>
            </div>
          </Link>

          <Link to="/fees" className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Fees & Fines</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dues balance & e-receipts</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Complaints & Emergency Contacts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Recent Complaints */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Recent Complaints & Issues
            </h2>
            <Link to="/my-complaints" style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all ({complaints.length}) <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No complaints filed yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                Everything looks good in your room! Report any maintenance issue anytime.
              </p>
              <Link to="/report" className="btn btn-primary">
                <PlusCircle size={16} /> Report Maintenance Issue
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.slice(0, 4).map((c) => (
                <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
                        {c.complaint_id}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>Reported: {new Date(c.created_at).toLocaleDateString()}</span>
                    <Link to={`/complaints/${c.id}`} style={{ color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Track Details <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Emergency Contacts Quick Card */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Hostel Emergency Contacts
            </h2>
            <Link to="/emergency-contacts" style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600 }}>
              Full Directory
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ background: 'var(--emergency-light)', color: '#EF4444', padding: '0.6rem', borderRadius: '8px' }}>
                <PhoneCall size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>Chief Warden Hotline</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dr. Rajesh Sharma • 24x7 Duty</div>
              </div>
              <a href="tel:+919876543210" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#F87171' }}>
                Call Warden
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', padding: '0.6rem', borderRadius: '8px' }}>
                <ShieldAlert size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>Campus Security Gate</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hostel Gate Patrol Crew</div>
              </div>
              <a href="tel:+919876500001" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60A5FA' }}>
                Ext 101
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.6rem', borderRadius: '8px' }}>
                <PhoneCall size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>Campus Health Clinic</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Medical Officer on Duty</div>
              </div>
              <a href="tel:+919876500002" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34D399' }}>
                Ext 108
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', padding: '0.6rem', borderRadius: '8px' }}>
                <Wrench size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>Electrical Emergency Desk</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Power Breakdown Unit</div>
              </div>
              <a href="tel:+919876500003" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FBBF24' }}>
                Ext 104
              </a>
            </div>

          </div>
        </div>

      </div>

      {/* Emergency SOS Modal */}
      <EmergencyModal 
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSuccess={loadDashboardData}
      />

    </div>
  );
};
