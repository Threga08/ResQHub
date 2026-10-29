import React, { useState, useEffect } from 'react';
import { 
  Ticket, PlusCircle, Clock, Calendar, CheckCircle, XCircle, 
  AlertCircle, QrCode, Phone, MapPin, Shield, ArrowRight, X
} from 'lucide-react';
import { gatePassService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const GatePassPage = () => {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Request Pass Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [formData, setFormData] = useState({
    pass_type: 'Day Outing',
    destination: '',
    reason: '',
    out_time: '',
    expected_in_time: '',
    parent_contact: user?.phone || ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPasses();
  }, []);

  const loadPasses = async () => {
    try {
      setLoading(true);
      const res = await gatePassService.getMyPasses();
      setPasses(res.data.passes);
    } catch (err) {
      console.error(err);
      setError('Failed to load your gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await gatePassService.request(formData);
      setSuccessMsg('Gate pass request submitted for Warden approval!');
      setShowApplyModal(false);
      setFormData({
        pass_type: 'Day Outing',
        destination: '',
        reason: '',
        out_time: '',
        expected_in_time: '',
        parent_contact: user?.phone || ''
      });
      loadPasses();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting gate pass');
    } finally {
      setSubmitting(false);
    }
  };

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
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        {status}
      </span>
    );
  };

  // Identify active pass (Approved or Out)
  const activePass = passes.find(p => p.status === 'Approved' || p.status === 'Out');

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Page Title & Action */}
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
              Gate Pass & Leave Management
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Request outings, view your digital security exit pass, and track approval status.
          </p>
        </div>

        <button 
          onClick={() => setShowApplyModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> Apply for Gate Pass
        </button>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Active Digital Pass Feature Card */}
      {activePass && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818CF8', letterSpacing: '0.05em' }}>
                  ACTIVE DIGITAL GATE PASS
                </span>
                {getStatusBadge(activePass.status)}
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                {activePass.pass_code}
              </h2>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved By</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10B981' }}>
                ✓ {activePass.approver_name || 'Chief Warden Office'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pass Category</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{activePass.pass_type}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Destination</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} color="#818CF8" /> {activePass.destination}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Departure Time</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {new Date(activePass.out_time).toLocaleString()}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Strict Curfew Return</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#EF4444' }}>
                {new Date(activePass.expected_in_time).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Security QR Simulation */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={48} color="#0B0F19" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Show this QR code at Hostel Main Security Checkpoint
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Guard scans to verify authorization and log outbound/inbound timestamps.
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Emergency Return Helpline: <strong>+91 98765 43210</strong>
            </div>
          </div>
        </div>
      )}

      {/* History Table Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          Pass Request History
        </h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading your passes...
          </div>
        ) : passes.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Ticket size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
            <p>No gate passes requested yet. Click "Apply for Gate Pass" to create one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Pass Code</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Destination & Reason</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Out Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Return Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.85rem' }}>
                {passes.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818CF8' }}>
                      {p.pass_code}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.pass_type}
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.destination}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.reason}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(p.out_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(p.expected_in_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(p.status)}
                      {p.rejection_reason && (
                        <div style={{ fontSize: '0.7rem', color: '#EF4444', marginTop: '4px' }}>
                          Note: {p.rejection_reason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Gate Pass Modal */}
      {showApplyModal && (
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
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Apply for Gate Pass
              </h3>
              <button 
                onClick={() => setShowApplyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ padding: '1.5rem' }}>
              {error && (
                <div style={{
                  backgroundColor: 'var(--emergency-light)',
                  color: 'var(--emergency)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Pass Type
                </label>
                <select 
                  className="form-control"
                  value={formData.pass_type}
                  onChange={(e) => setFormData({ ...formData, pass_type: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Day Outing">Day Outing (Return by 09:30 PM)</option>
                  <option value="Night Out">Night Out (Returning next morning)</option>
                  <option value="Home Leave">Home Leave (Multiple Days)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Destination Address / Place
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Phoenix Mall / Central City Library / Home City"
                  className="form-control"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Departure Date & Time
                  </label>
                  <input 
                    type="datetime-local"
                    required
                    className="form-control"
                    value={formData.out_time}
                    onChange={(e) => setFormData({ ...formData, out_time: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Expected Return Date & Time
                  </label>
                  <input 
                    type="datetime-local"
                    required
                    className="form-control"
                    value={formData.expected_in_time}
                    onChange={(e) => setFormData({ ...formData, expected_in_time: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Parent / Guardian Contact Phone
                </label>
                <input 
                  type="tel"
                  placeholder="+91 98765 00000"
                  className="form-control"
                  value={formData.parent_contact}
                  onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Reason for Outing / Leave
                </label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Provide specific reason for Warden approval..."
                  className="form-control"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
