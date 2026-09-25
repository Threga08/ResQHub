import React, { useState } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { adminService, staffService } from '../services/api';

export const UpdateStatusModal = ({ isOpen, complaint, userRole, onClose, onSuccess }) => {
  const [status, setStatus] = useState(complaint?.status || 'In Progress');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const allowedStatuses = userRole === 'staff' 
    ? ['In Progress', 'Resolved'] 
    : ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userRole === 'staff') {
        await staffService.updateStatus(complaint.id, status, remarks);
      } else {
        await adminService.updateComplaintStatus(complaint.id, status, remarks);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              Update Complaint Status
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complaint #{complaint.complaint_id} • Current: {complaint.status}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--emergency)', color: '#F87171', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Status *</label>
            <select 
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {allowedStatuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {status === 'Resolved' ? 'Resolution Notes / Actions Taken *' : 'Remarks / Updates'}
            </label>
            <textarea 
              className="form-textarea"
              rows={3}
              placeholder={status === 'Resolved' ? "Describe the repair performed, parts replaced, and verification..." : "Add status remarks..."}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required={status === 'Resolved'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Save Status Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
