import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, CheckCircle2, Clock, Phone, MapPin, Edit3, ExternalLink, ArrowRight } from 'lucide-react';
import { staffService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { UpdateStatusModal } from '../components/UpdateStatusModal';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active' vs 'all'

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await staffService.getAssignedComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsStatusModalOpen(true);
  };

  const inProgressList = complaints.filter(c => c.status === 'In Progress');
  const assignedList = complaints.filter(c => c.status === 'Assigned');
  const resolvedList = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status !== 'Resolved' && c.status !== 'Closed';
    if (filter === 'resolved') return c.status === 'Resolved' || c.status === 'Closed';
    return true;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Technician Portal</span> • <span>Specialization: {user?.specialization || 'Facility Staff'}</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Assigned Work Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Welcome {user?.name}. Review your active repair tickets and record resolution notes.
          </p>
        </div>

        {/* Filter toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setFilter('active')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filter === 'active' ? 'var(--primary)' : 'transparent',
              color: filter === 'active' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Active Tasks ({assignedList.length + inProgressList.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filter === 'all' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            All Assigned ({complaints.length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filter === 'resolved' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'resolved' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Completed ({resolvedList.length})
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Assigned</span>
            <div style={{ color: '#8B5CF6', background: 'var(--purple-light)', padding: '0.45rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {assignedList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting start</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>In Progress</span>
            <div style={{ color: '#3B82F6', background: 'rgba(59, 130, 246, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <Wrench size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {inProgressList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under inspection / repair</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolved Jobs</span>
            <div style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>
            {resolvedList.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34D399' }}>Finished maintenance jobs</div>
        </div>

      </div>

      {/* Assigned Tasks List */}
      {loading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your assigned tasks...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={40} color="#10B981" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>No tasks in this category</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            You have no active work orders pending action right now.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.95rem', color: '#818CF8' }}>
                    {c.complaint_id}
                  </span>
                  <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                    {c.category}
                  </span>
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Location: <strong style={{ color: '#FFFFFF' }}>{c.hostel_block} • Room {c.room_number}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {c.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>Student: <strong style={{ color: '#FFFFFF' }}>{c.student_name}</strong></span>
                  {c.student_phone && (
                    <a href={`tel:${c.student_phone}`} style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={13} /> {c.student_phone}
                    </a>
                  )}
                  <span>Reported: {new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => openStatusModal(c)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
                  >
                    <Edit3 size={15} /> Update Status & Notes
                  </button>
                  <Link 
                    to={`/complaints/${c.id}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    View Details <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      <UpdateStatusModal 
        isOpen={isStatusModalOpen}
        complaint={selectedComplaint}
        userRole="staff"
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadComplaints}
      />

    </div>
  );
};
