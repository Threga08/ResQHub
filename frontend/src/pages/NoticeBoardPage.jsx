import React, { useState, useEffect } from 'react';
import { 
  Bell, Pin, PlusCircle, Trash2, Calendar, AlertTriangle, 
  Megaphone, Clock, Filter, X, CheckCircle, Tag
} from 'lucide-react';
import { noticeService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NoticeBoardPage = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Post Notice Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    is_pinned: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [selectedCategory]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeService.getAll(selectedCategory !== 'All' ? { category: selectedCategory } : {});
      setNotices(res.data.notices);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await noticeService.create(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        category: 'General',
        priority: 'Normal',
        is_pinned: false
      });
      loadNotices();
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await noticeService.delete(id);
      loadNotices();
    } catch (err) {
      alert('Error deleting notice');
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await noticeService.togglePin(id);
      loadNotices();
    } catch (err) {
      alert('Error changing pin status');
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.35)' };
      case 'Important':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.35)' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.35)' };
    }
  };

  const isWarden = user?.role === 'warden';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Title Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444'
            }}>
              <Megaphone size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hostel Notice Board & Broadcasts
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Official announcements, scheduled utility shutdowns, mess notifications, and urgent campus alerts.
          </p>
        </div>

        {isWarden && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> Post Announcement
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {['All', 'General', 'Maintenance', 'Curfew', 'Mess', 'Event'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid ' + (selectedCategory === cat ? '#6366F1' : 'var(--border-subtle)'),
              backgroundColor: selectedCategory === cat ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)',
              color: selectedCategory === cat ? '#818CF8' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading notices...
        </div>
      ) : notices.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Megaphone size={40} style={{ opacity: 0.4, marginBottom: '0.75rem' }} />
          <p>No active notices found in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {notices.map((n) => {
            const pStyle = getPriorityStyle(n.priority);
            return (
              <div 
                key={n.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderLeft: n.is_pinned ? '4px solid #818CF8' : `4px solid ${pStyle.text}`,
                  position: 'relative'
                }}
              >
                {/* Header line */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    {n.is_pinned && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: '#818CF8',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        <Pin size={12} /> PINNED ANNOUNCEMENT
                      </span>
                    )}

                    <span style={{
                      backgroundColor: pStyle.bg,
                      color: pStyle.text,
                      border: `1px solid ${pStyle.border}`,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {n.priority}
                    </span>

                    <span style={{
                      backgroundColor: 'var(--bg-app)',
                      color: 'var(--text-secondary)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}>
                      #{n.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} />
                      {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {isWarden && (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleTogglePin(n.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: n.is_pinned ? '#818CF8' : 'var(--text-muted)',
                            padding: '0.25rem'
                          }}
                          title={n.is_pinned ? "Unpin notice" : "Pin to top"}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(n.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '0.25rem'
                          }}
                          title="Delete notice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                  {n.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {n.content}
                </p>

                {/* Author footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Issued By: <strong>{n.author_name}</strong></span>
                  <span>ResQHub Campus Alert System</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Notice Modal */}
      {showCreateModal && (
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
                Publish Campus Notice
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Notice Headline / Title
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Water Tank Maintenance Schedule / Wi-Fi Outage"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Category
                  </label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="General">General Announcement</option>
                    <option value="Maintenance">Maintenance & Power</option>
                    <option value="Curfew">Curfew & Discipline</option>
                    <option value="Mess">Mess & Dining</option>
                    <option value="Emergency">Emergency Alert</option>
                    <option value="Event">Event & Sports</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Urgency Priority
                  </label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent / Action Required</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Detailed Announcement Content
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Provide complete dates, affected rooms/blocks, and instructions for residents..."
                  className="form-control"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="pinCheck" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  Pin this announcement to top of Notice Board
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  {submitting ? 'Publishing...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
