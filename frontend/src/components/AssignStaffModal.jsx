import React, { useState, useEffect } from 'react';
import { X, Wrench, UserCheck } from 'lucide-react';
import { adminService } from '../services/api';

export const AssignStaffModal = ({ isOpen, complaint, onClose, onSuccess }) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadStaff();
      setSelectedStaffId(complaint?.assigned_to || '');
      setRemarks('');
      setError('');
    }
  }, [isOpen, complaint]);

  const loadStaff = async () => {
    try {
      const res = await adminService.getStaff();
      setStaffList(res.data.staff || []);
      if (res.data.staff?.length > 0 && !complaint?.assigned_to) {
        setSelectedStaffId(res.data.staff[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load maintenance staff directory');
    }
  };

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      setError('Please select a maintenance technician');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await adminService.assignComplaint(complaint.id, selectedStaffId, remarks);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--purple-light)', color: '#C084FC', padding: '0.5rem', borderRadius: '8px' }}>
              <UserCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                Assign Maintenance Staff
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Complaint #{complaint.complaint_id} • {complaint.category}
              </p>
            </div>
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
            <label className="form-label">Select Technician / Staff Member *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {staffList.map((staff) => {
                const isSelected = String(selectedStaffId) === String(staff.id);
                return (
                  <label 
                    key={staff.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-app)',
                      cursor: 'pointer'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="staff_select" 
                      checked={isSelected}
                      onChange={() => setSelectedStaffId(staff.id)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF' }}>{staff.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Specialization: {staff.specialization || 'General Works'} • Phone: {staff.phone || 'N/A'}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Remarks / Instructions</label>
            <textarea 
              className="form-textarea"
              rows={2}
              placeholder="e.g. Please carry replacement regulator and inspect earthing line..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
