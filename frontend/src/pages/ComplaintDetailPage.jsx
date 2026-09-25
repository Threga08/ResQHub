import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, MapPin, Phone, Wrench, Shield, 
  CheckCircle, Clock, AlertTriangle, ExternalLink, Edit3, UserCheck 
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ComplaintTimeline } from '../components/Timeline';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';

export const ComplaintDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getDetail(id);
      setComplaint(res.data.complaint);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading complaint ticket...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--emergency)', marginBottom: '1rem' }}>{error || 'Complaint not found'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Return Back
        </button>
      </div>
    );
  }

  const isWarden = user?.role === 'warden';
  const isAssignedStaff = user?.role === 'staff' && complaint.assigned_to === user?.id;

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';
    return `${base}${path}`;
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '960px' }}>
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Main Ticket Card */}
      <div className="card" style={{ padding: '2.25rem', marginBottom: '2rem' }}>
        
        {/* Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#818CF8' }}>
                {complaint.complaint_id}
              </span>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                {complaint.category}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reported on {new Date(complaint.created_at).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />

            {/* Quick Actions for Warden & Staff */}
            {isWarden && (
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                <button 
                  onClick={() => setIsAssignModalOpen(true)}
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <UserCheck size={14} /> Assign Staff
                </button>
                <button 
                  onClick={() => setIsStatusModalOpen(true)}
                  className="btn btn-primary" 
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <Edit3 size={14} /> Update Status
                </button>
              </div>
            )}

            {isAssignedStaff && (
              <button 
                onClick={() => setIsStatusModalOpen(true)}
                className="btn btn-primary" 
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                <Edit3 size={14} /> Update Resolution Status
              </button>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div style={{ margin: '1.75rem 0' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
            {complaint.title}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {complaint.description}
          </p>
        </div>

        {/* Photo Proof Attachment */}
        {complaint.image_url && (
          <div style={{ margin: '1.5rem 0', background: 'var(--bg-app)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Attached Photo Evidence:
            </div>
            <a href={getImageUrl(complaint.image_url)} target="_blank" rel="noopener noreferrer">
              <img 
                src={getImageUrl(complaint.image_url)} 
                alt="Complaint attachment" 
                style={{ maxHeight: '280px', maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'block' }} 
              />
            </a>
          </div>
        )}

        {/* Metadata info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          
          {/* Student Info */}
          <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Student Information
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <User size={16} color="var(--text-secondary)" />
              <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>{complaint.student_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <MapPin size={14} />
              <span>{complaint.hostel_block} • Room {complaint.room_number}</span>
            </div>
            {complaint.student_phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <Phone size={14} />
                <span>{complaint.student_phone}</span>
              </div>
            )}
          </div>

          {/* Assigned Technician Info */}
          <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Assigned Maintenance Crew
            </div>
            {complaint.assigned_to ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Wrench size={16} color="#818CF8" />
                  <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>{complaint.assigned_staff_name}</span>
                </div>
                {complaint.assigned_staff_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Phone size={14} />
                    <span>{complaint.assigned_staff_phone}</span>
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.35rem', fontWeight: 600 }}>
                  Assigned technician in charge of repairs
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Pending allocation by Hostel Warden.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Stage Tracker & Audit History Card */}
      <div className="card" style={{ padding: '2.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>
          Lifecycle Progress Tracker
        </h2>
        <ComplaintTimeline 
          currentStatus={complaint.status} 
          history={complaint.history || []} 
        />
      </div>

      {/* Modals */}
      <AssignStaffModal 
        isOpen={isAssignModalOpen}
        complaint={complaint}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadDetail}
      />

      <UpdateStatusModal 
        isOpen={isStatusModalOpen}
        complaint={complaint}
        userRole={user?.role}
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadDetail}
      />

    </div>
  );
};
