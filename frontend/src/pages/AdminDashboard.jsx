import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Wrench, Clock, CheckCircle2, AlertOctagon, 
  UserCheck, ArrowRight, ExternalLink, Filter, Edit3, CheckCircle 
} from 'lucide-react';
import { adminService } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, emergenciesRes, complaintsRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getEmergencies(),
        adminService.getComplaints()
      ]);
      setAnalytics(analyticsRes.data);
      setEmergencies(emergenciesRes.data.emergencies || []);
      setComplaints(complaintsRes.data.complaints || []);
    } catch (err) {
      console.error("Admin dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeEmergency = async (id) => {
    try {
      await adminService.acknowledgeEmergency(id, 'Response in Progress');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveEmergency = async (id) => {
    try {
      await adminService.resolveEmergency(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusModalOpen(true);
  };

  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Admin Command Center</span> • <span>Warden Oversight</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Hostel Operations Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/emergencies" className="btn btn-danger">
            <AlertOctagon size={16} /> Live SOS ({activeEmergencies.length})
          </Link>
          <Link to="/admin/complaints" className="btn btn-secondary">
            <Wrench size={16} /> All Complaints
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active SOS Alerts</span>
            <div style={{ color: '#EF4444', background: 'rgba(239, 68, 68, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <AlertOctagon size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {analytics?.summary?.active_emergencies ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '0.2rem' }}>
            Requires immediate attention
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Complaints</span>
            <div style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {analytics?.summary?.pending_complaints ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Awaiting assignment / review
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>In Progress</span>
            <div style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {analytics?.summary?.in_progress_complaints ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Currently undergoing technician fix
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolved</span>
            <div style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {analytics?.summary?.resolved_complaints ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.2rem' }}>
            Successfully resolved issues
          </div>
        </div>

      </div>

      {/* Active Emergencies Action Table */}
      <div className="card" style={{ marginBottom: '2.5rem', border: activeEmergencies.length > 0 ? '1px solid var(--emergency)' : '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--emergency)', color: '#FFFFFF', padding: '0.45rem', borderRadius: '8px' }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                Active Emergency Alerts
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Direct SOS calls initiated by hostel students
              </p>
            </div>
          </div>
          <Link to="/admin/emergencies" style={{ fontSize: '0.85rem', color: '#F87171', fontWeight: 600 }}>
            View All ({emergencies.length})
          </Link>
        </div>

        {activeEmergencies.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
            No active emergencies at this time. All quiet across hostel blocks.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activeEmergencies.map((e) => (
              <div 
                key={e.id}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-priority-emergency">{e.emergency_type}</span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                      {e.hostel_block} - Room {e.room_number}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Student: {e.student_name} ({e.student_phone || 'No phone'})
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#FCA5A5' }}>
                    {e.description || 'Immediate emergency assistance requested.'}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Triggered: {new Date(e.created_at).toLocaleTimeString()} ({new Date(e.created_at).toLocaleDateString()})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {e.status === 'Alert Sent' && (
                    <button 
                      onClick={() => handleAcknowledgeEmergency(e.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', backgroundColor: '#F59E0B' }}
                    >
                      Acknowledge & Respond
                    </button>
                  )}
                  <button 
                    onClick={() => handleResolveEmergency(e.id)}
                    className="btn btn-success"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <CheckCircle size={14} /> Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Complaints Management Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              Complaints Awaiting Action
            </h2>
            <Link to="/admin/complaints" style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 600 }}>
              Manage All Complaints <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {complaints.slice(0, 5).map((c) => (
              <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818CF8', fontSize: '0.85rem' }}>
                      {c.complaint_id}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{c.category}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.hostel_block} - {c.room_number}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Student: {c.student_name} • Reported: {new Date(c.created_at).toLocaleDateString()}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Assigned: <strong style={{ color: '#FFFFFF' }}>{c.assigned_staff_name || 'None'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      onClick={() => openAssignModal(c)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      <UserCheck size={13} /> Assign
                    </button>
                    <button 
                      onClick={() => openStatusModal(c)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Edit3 size={13} /> Status
                    </button>
                    <Link 
                      to={`/complaints/${c.id}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Category & Priority Distribution */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Category Distribution
          </h2>

          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            {analytics?.by_category && Object.entries(analytics.by_category).map(([cat, count]) => {
              const total = analytics.summary.total_complaints || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Priority Breakdown
          </h2>

          <div className="card" style={{ padding: '1.25rem' }}>
            {analytics?.by_priority && Object.entries(analytics.by_priority).map(([prio, count]) => {
              const total = analytics.summary.total_complaints || 1;
              const pct = Math.round((count / total) * 100);
              const color = prio === 'Emergency' ? '#EF4444' : prio === 'High' ? '#FB923C' : prio === 'Medium' ? '#FBBF24' : '#94A3B8';
              return (
                <div key={prio} style={{ marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color, fontWeight: 600 }}>{prio}</span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Modals */}
      <AssignStaffModal 
        isOpen={isAssignModalOpen}
        complaint={selectedComplaint}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadData}
      />

      <UpdateStatusModal 
        isOpen={isStatusModalOpen}
        complaint={selectedComplaint}
        userRole="warden"
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadData}
      />

    </div>
  );
};
