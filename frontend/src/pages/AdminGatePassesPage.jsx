import React, { useState, useEffect } from 'react';
import { 
  Ticket, CheckCircle, XCircle, Clock, Search, Filter, 
  MapPin, Phone, User, Check, X, LogOut as GateOut, LogIn as GateIn, AlertCircle
} from 'lucide-react';
import { gatePassService } from '../services/api';

export const AdminGatePassesPage = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Reject modal state
  const [rejectingPass, setRejectingPass] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      setLoading(true);
      const res = await gatePassService.getAll();
      setPasses(res.data.passes);
    } catch (err) {
      console.error(err);
      setError('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (passId, newStatus, reason = '') => {
    try {
      await gatePassService.updateStatus(passId, newStatus, reason);
      loadPasses();
      if (rejectingPass) {
        setRejectingPass(null);
        setRejectReason('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating pass status');
    }
  };

  const filteredPasses = passes.filter((p) => {
    const matchesTab = 
      activeTab === 'All' ? true :
      activeTab === 'Pending' ? p.status === 'Pending' :
      activeTab === 'Active' ? (p.status === 'Approved' || p.status === 'Out') :
      activeTab === 'Completed' ? p.status === 'Returned' :
      p.status === activeTab;

    const matchesSearch = 
      p.pass_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const map = {
      'Approved': { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' },
      'Pending': { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
      'Rejected': { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
      'Out': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
      'Returned': { bg: 'rgba(148, 163, 184, 0.15)', text: 'var(--text-secondary)', border: 'var(--border-subtle)' }
    };
    const s = map[status] || map['Pending'];
    return (
      <span style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-full)',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  const pendingCount = passes.filter(p => p.status === 'Pending').length;
  const activeOutCount = passes.filter(p => p.status === 'Out').length;
  const approvedCount = passes.filter(p => p.status === 'Approved').length;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8'
            }}>
              <Ticket size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hostel Gate Pass Command Center
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Review outing requests, authorize curfew departures, and log campus security check-ins.
          </p>
        </div>
      </div>

      {/* Metric Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>Pending Review</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{pendingCount}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>Approved (Ready)</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{approvedCount}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase' }}>Currently Outside</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{activeOutCount}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Passes Logged</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{passes.length}</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Pending', 'Active', 'Completed', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeTab === tab ? '#4F46E5' : 'var(--bg-app)',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search code, student, room..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Passes Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading gate passes...
          </div>
        ) : filteredPasses.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No passes found matching your filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Pass Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Student & Room</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination & Reason</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Schedule</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {filteredPasses.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818CF8' }}>
                      {p.pass_code}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-main)' }}>
                        {p.pass_type}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {p.hostel_block} • {p.room_number}
                      </div>
                      {p.student_phone && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          📞 {p.student_phone}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.destination}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {p.reason}
                      </div>
                      {p.parent_contact && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Parent: {p.parent_contact}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', fontSize: '0.8rem' }}>
                      <div>Out: <span style={{ color: 'var(--text-secondary)' }}>{new Date(p.out_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div>In: <span style={{ color: '#EF4444', fontWeight: 600 }}>{new Date(p.expected_in_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                      {p.actual_in_time && (
                        <div style={{ color: '#10B981', fontSize: '0.75rem' }}>
                          Returned: {new Date(p.actual_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(p.status)}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {p.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'Approved')}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', backgroundColor: '#10B981', borderColor: '#059669' }}
                              title="Approve Pass"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectingPass(p)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#EF4444' }}
                              title="Reject Pass"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}

                        {p.status === 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Out')}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#818CF8' }}
                            title="Security Gate: Student has exited campus"
                          >
                            <GateOut size={14} /> Log Exit
                          </button>
                        )}

                        {p.status === 'Out' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'Returned')}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', backgroundColor: '#10B981', borderColor: '#059669' }}
                            title="Security Gate: Student has returned to campus"
                          >
                            <GateIn size={14} /> Log Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingPass && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '440px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Reject Pass ({rejectingPass.pass_code})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Student: {rejectingPass.student_name} ({rejectingPass.room_number})
            </p>

            <textarea 
              rows={3}
              placeholder="Enter reason for rejection (e.g. Incomplete parent permission, academic conflict)..."
              className="form-control"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', marginBottom: '1.25rem', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRejectingPass(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectingPass.id, 'Rejected', rejectReason)}
                className="btn btn-primary"
                style={{ backgroundColor: '#EF4444', borderColor: '#DC2626' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
