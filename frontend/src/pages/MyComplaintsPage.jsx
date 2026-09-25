import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, Wrench, ArrowRight, ExternalLink } from 'lucide-react';
import { complaintService } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const statuses = ['all', 'Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            My Maintenance Tickets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Track the real-time resolution timeline of your submitted complaints
          </p>
        </div>
        <Link to="/report" className="btn btn-primary">
          <PlusCircle size={18} /> Report New Issue
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '2px' }}>
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
              {st === 'all' ? 'All Tickets' : st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', padding: '0.5rem 0.85rem 0.5rem 2.2rem', fontSize: '0.85rem' }}
            placeholder="Search by ID or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

      </div>

      {/* List / Empty State */}
      {loading ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your tickets...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Wrench size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No matching complaints found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search criteria or filters.' : 'You have not submitted any complaints yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: '#818CF8' }}>
                    {c.complaint_id}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Category: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{c.category}</span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                  {c.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </p>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                <Link to={`/complaints/${c.id}`} style={{ color: '#818CF8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View Full Timeline <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
