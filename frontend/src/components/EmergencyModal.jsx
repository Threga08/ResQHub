import React, { useState } from 'react';
import { AlertTriangle, Flame, ShieldAlert, Zap, HelpCircle, HeartPulse, CheckCircle2, X } from 'lucide-react';
import { emergencyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emergencyTypes = [
  { id: 'Medical', label: 'Medical Emergency', icon: HeartPulse, color: '#EF4444', desc: 'Severe injury, breathing distress, sudden illness' },
  { id: 'Fire', label: 'Fire Outbreak', icon: Flame, color: '#F97316', desc: 'Smoke, open fire, or burning smell in hostel' },
  { id: 'Electrical Hazard', label: 'Electrical Hazard', icon: Zap, color: '#EAB308', desc: 'Sparks, high-voltage wire shock, smoke from board' },
  { id: 'Security', label: 'Security Threat', icon: ShieldAlert, color: '#8B5CF6', desc: 'Intruder, harassment, violent altercation' },
  { id: 'Other', label: 'Other Critical Hazard', icon: HelpCircle, color: '#06B6D4', desc: 'Structural hazard, water overflow, gas leak' }
];

export const EmergencyModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, fetchUnreadCount } = useAuth();
  const [step, setStep] = useState('confirm'); // 'confirm' -> 'sent'
  const [selectedType, setSelectedType] = useState('Medical');
  const [description, setDescription] = useState('');
  const [hostelBlock, setHostelBlock] = useState(user?.hostel_block || '');
  const [roomNumber, setRoomNumber] = useState(user?.room_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendAlert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await emergencyService.trigger({
        emergency_type: selectedType,
        description: description.trim(),
        hostel_block: hostelBlock || user?.hostel_block || 'Main Block',
        room_number: roomNumber || user?.room_number || 'Room N/A'
      });
      setStep('sent');
      if (fetchUnreadCount) fetchUnreadCount();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to dispatch alert. Please contact warden hotline immediately!');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('confirm');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ border: '2px solid var(--emergency)', position: 'relative' }}>
        <button 
          onClick={resetAndClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {step === 'confirm' ? (
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--emergency-light)', padding: '0.6rem', borderRadius: '50%', color: 'var(--emergency)' }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Emergency SOS Alert
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#F87171' }}>
                  Are you sure you want to send an emergency alert?
                </p>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--emergency)', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSendAlert}>
              <div className="form-group">
                <label className="form-label">Select Emergency Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
                  {emergencyTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.85rem 0.5rem',
                          borderRadius: '10px',
                          border: isSelected ? `2px solid ${type.color}` : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-app)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={22} color={isSelected ? type.color : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, textAlign: 'center' }}>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hostel Block</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={hostelBlock} 
                    onChange={(e) => setHostelBlock(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Details (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Provide urgent details (e.g. conscious state, floor number, hazard location)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={resetAndClose} disabled={loading}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger" 
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 700 }}
                  disabled={loading}
                >
                  {loading ? 'Broadcasting SOS...' : 'Confirm & Dispatch SOS'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Emergency Alert Sent Successfully.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              The hostel warden, campus medical officer, and emergency security crew have been alerted. Stay in a safe position. Response is being coordinated.
            </p>
            <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>
              <div><strong>Emergency Type:</strong> {selectedType}</div>
              <div><strong>Location:</strong> {hostelBlock} - Room {roomNumber}</div>
              <div><strong>Status:</strong> <span style={{ color: '#F87171', fontWeight: 600 }}>Alert Sent (Awaiting Warden Acknowledgment)</span></div>
            </div>
            <button className="btn btn-primary" onClick={resetAndClose} style={{ width: '100%' }}>
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
