import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Wrench, UserCheck, Edit3, ExternalLink, ArrowRight } from 'lucide-react';
import { adminService } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { AssignStaffModal } from '../components/AssignStaffModal';
import { UpdateStatusModal } from '../components/UpdateStatusModal';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.getComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    const matchesSearch = searchTerm === '' ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hostel_block.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
  });

  const statuses = ['all', 'Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  const categories = ['all', 'Plumbing', 'Electrical', 'Water', 'Wi-Fi/Internet', 'Furniture', 'Cleaning', 'Other'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF' }}>
          All Hostel Complaints
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Central management, staff assignment, and status updates for all hostel blocks
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Top filter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {statuses.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: statusFilter === st ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: statusFilter === st ? 'var(--primary)' : 'transparent',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', padding: '0.5rem 0.85rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
              placeholder="Search student, ID, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

        </div>

        {/* Second filter row */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
            <select
              className="form-select"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            <select
              className="form-select"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> of {complaints.length} tickets
          </div>
        </div>

      </div>

      {/* Complaints Table / List */}
      {loading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading complaints list...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Wrench size={38} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No complaints matched criteria</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {c.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span>Student: <strong style={{ color: 'var(--text-secondary)' }}>{c.student_name}</strong> ({c.student_phone || 'N/A'})</span>
                  <span>Assigned Staff: <strong style={{ color: '#FFFFFF' }}>{c.assigned_staff_name || 'Unassigned'}</strong></span>
                  <span>Date: {new Date(c.created_at).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => openAssignModal(c)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <UserCheck size={14} /> Assign Staff
                  </button>
                  <button 
                    onClick={() => openStatusModal(c)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Edit3 size={14} /> Update Status
                  </button>
                  <Link 
                    to={`/complaints/${c.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Details <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AssignStaffModal 
        isOpen={isAssignModalOpen}
        complaint={selectedComplaint}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={loadComplaints}
      />

      <UpdateStatusModal 
        isOpen={isStatusModalOpen}
        complaint={selectedComplaint}
        userRole="warden"
        onClose={() => setIsStatusModalOpen(false)}
        onSuccess={loadComplaints}
      />

    </div>
  );
};
