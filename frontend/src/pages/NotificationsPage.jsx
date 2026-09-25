import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert, Wrench, CheckCircle, Clock } from 'lucide-react';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage = () => {
  const { fetchUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '800px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF' }}>
            Notifications & Alerts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time updates on your emergency calls and maintenance tickets
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Bell size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>No notifications yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            You will receive updates here whenever a complaint status changes or alerts trigger.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map(n => {
            const isEmergency = n.type === 'emergency';
            return (
              <div 
                key={n.id}
                className="card"
                style={{
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  backgroundColor: n.is_read ? 'var(--bg-card)' : 'rgba(79, 70, 229, 0.12)',
                  border: n.is_read ? '1px solid var(--border-subtle)' : isEmergency ? '1px solid var(--emergency)' : '1px solid #6366F1'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: isEmergency ? 'var(--emergency-light)' : 'rgba(99, 102, 241, 0.2)',
                    color: isEmergency ? '#EF4444' : '#818CF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isEmergency ? <ShieldAlert size={18} /> : <Wrench size={18} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isEmergency ? '#F87171' : '#FFFFFF' }}>
                      {n.title}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: 1.5 }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem', flexShrink: 0 }}
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
