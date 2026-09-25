import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, CheckCircle2, Clock, Phone, MapPin, 
  Flame, HeartPulse, ShieldAlert, Zap, HelpCircle, CheckCircle 
} from 'lucide-react';
import { adminService } from '../services/api';

const typeIcons = {
  'Medical': HeartPulse,
  'Fire': Flame,
  'Security': ShieldAlert,
  'Electrical Hazard': Zap,
  'Other': HelpCircle
};

export const AdminEmergenciesPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active' vs 'all'

  useEffect(() => {
    loadEmergencies();
  }, []);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEmergencies();
      setEmergencies(res.data.emergencies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id, status = 'Response in Progress') => {
    try {
      await adminService.acknowledgeEmergency(id, status);
      loadEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await adminService.resolveEmergency(id);
      loadEmergencies();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = emergencies.filter(e => {
    if (filter === 'active') return e.status !== 'Resolved';
    if (filter === 'resolved') return e.status === 'Resolved';
    return true;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#EF4444', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <AlertOctagon size={16} /> EMERGENCY RESPONSE DISPATCH
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            Hostel SOS Alerts & Urgent Incidents
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Coordinate rapid intervention for student safety, medical, and fire hazards
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
              background: filter === 'active' ? 'var(--emergency)' : 'transparent',
              color: filter === 'active' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Active Incidents ({emergencies.filter(e => e.status !== 'Resolved').length})
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
            All Incident Logs ({emergencies.length})
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
            Resolved ({emergencies.filter(e => e.status === 'Resolved').length})
          </button>
        </div>
      </div>

      {/* Incident Cards */}
      {loading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading emergency alerts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="#10B981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
            No Active Emergencies
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            All clear. Emergency medical and security channels are currently monitoring normal conditions.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map(e => {
            const Icon = typeIcons[e.emergency_type] || AlertOctagon;
            const isResolved = e.status === 'Resolved';
            return (
              <div 
                key={e.id}
                className="card"
                style={{
                  border: isResolved ? '1px solid var(--border-subtle)' : '2px solid var(--emergency)',
                  background: isResolved ? 'var(--bg-card)' : 'rgba(239, 68, 68, 0.06)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: isResolved ? 'rgba(16, 185, 129, 0.15)' : 'var(--emergency)',
                      color: isResolved ? '#34D399' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                          {e.emergency_type} Emergency
                        </h3>
                        <span className={`badge ${isResolved ? 'badge-resolved' : 'badge-priority-emergency'}`}>
                          {e.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Triggered on {new Date(e.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {e.status === 'Alert Sent' && (
                      <button
                        onClick={() => handleAcknowledge(e.id, 'Response in Progress')}
                        className="btn btn-primary"
                        style={{ backgroundColor: '#F59E0B', borderColor: '#D97706' }}
                      >
                        <Clock size={16} /> Acknowledge & Deploy
                      </button>
                    )}
                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(e.id)}
                        className="btn btn-success"
                      >
                        <CheckCircle size={16} /> Mark Incident Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Text */}
                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Situation Report / Message:
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#FFFFFF', lineHeight: 1.5 }}>
                    {e.description || 'Student triggered SOS emergency without additional comment. Send quick response team.'}
                  </p>
                </div>

                {/* Student coordinates footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F87171', fontWeight: 700 }}>
                      <MapPin size={16} /> Location: {e.hostel_block} • Room {e.room_number}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Student: <strong style={{ color: '#FFFFFF' }}>{e.student_name}</strong>
                    </span>
                    {e.student_phone && (
                      <a href={`tel:${e.student_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60A5FA', fontWeight: 600 }}>
                        <Phone size={14} /> {e.student_phone}
                      </a>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {e.acknowledged_at && <span>Ack: {new Date(e.acknowledged_at).toLocaleTimeString()} • </span>}
                    {e.resolved_at && <span>Resolved: {new Date(e.resolved_at).toLocaleTimeString()}</span>}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
