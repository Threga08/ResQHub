import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, Bell, LogOut, User as UserIcon, AlertOctagon, 
  Wrench, CheckCircle, BarChart3, Users, Home, PlusCircle, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const { user, logout, unreadNotifs, fetchUnreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (showNotifMenu) {
      loadNotifs();
    }
  }, [showNotifMenu]);

  const loadNotifs = async () => {
    try {
      setLoadingNotifs(true);
      const res = await notificationService.getAll();
      setRecentNotifs(res.data.notifications.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchUnreadCount();
      setShowNotifMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      transition: 'background-color 0.25s ease, border-color 0.25s ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #4F46E5 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              ResQ<span style={{ color: '#EF4444' }}>Hub</span>
            </span>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-3px' }}>
              Hostel Emergency & Facility
            </div>
          </div>
        </Link>

        {/* Navigation Links based on role */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {user.role === 'student' && (
              <>
                <Link to="/student" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/student') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Dashboard
                </Link>
                <Link to="/report" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/report') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Report Issue
                </Link>
                <Link to="/my-complaints" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/my-complaints') ? '#818CF8' : 'var(--text-secondary)' }}>
                  My Complaints
                </Link>
                <Link to="/emergency-contacts" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/emergency-contacts') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Emergency Directory
                </Link>
              </>
            )}

            {user.role === 'warden' && (
              <>
                <Link to="/admin" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/admin') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Dashboard
                </Link>
                <Link to="/admin/emergencies" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/admin/emergencies') ? '#EF4444' : 'var(--text-secondary)' }}>
                  Emergency Alerts
                </Link>
                <Link to="/admin/complaints" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/admin/complaints') ? '#818CF8' : 'var(--text-secondary)' }}>
                  All Complaints
                </Link>
                <Link to="/admin/analytics" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/admin/analytics') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Analytics
                </Link>
              </>
            )}

            {user.role === 'staff' && (
              <>
                <Link to="/staff" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/staff') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Staff Dashboard
                </Link>
                <Link to="/staff/tasks" style={{ fontSize: '0.875rem', fontWeight: 600, color: isActive('/staff/tasks') ? '#818CF8' : 'var(--text-secondary)' }}>
                  Assigned Complaints
                </Link>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Register Student
            </Link>
          </div>
        )}

        {/* Right User & Theme Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative' }}>
          
          {/* Theme Toggle (White / Dark) */}
          <ThemeToggle />

          {user && (
            <>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  style={{
                    position: 'relative',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    color: showNotifMenu ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: showNotifMenu ? 'var(--bg-card-hover)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifs > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: 'var(--emergency)',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 8px rgba(239,68,68,0.7)'
                    }}>
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {/* Notification Popover */}
                {showNotifMenu && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '340px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Notifications</span>
                      {unreadNotifs > 0 && (
                        <button onClick={handleMarkAllRead} style={{ fontSize: '0.75rem', color: '#818CF8', fontWeight: 600 }}>
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {loadingNotifs ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Loading...
                        </div>
                      ) : recentNotifs.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          No new notifications
                        </div>
                      ) : (
                        recentNotifs.map((n) => (
                          <div 
                            key={n.id} 
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border-subtle)',
                              backgroundColor: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)'
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: n.type === 'emergency' ? '#EF4444' : 'var(--text-primary)' }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <Link 
                      to="/notifications" 
                      onClick={() => setShowNotifMenu(false)}
                      style={{
                        display: 'block',
                        padding: '0.65rem',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-card-hover)',
                        color: 'var(--text-secondary)',
                        borderTop: '1px solid var(--border-subtle)'
                      }}
                    >
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'warden' ? '#EF4444' : user.role === 'staff' ? '#F59E0B' : '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FFFFFF'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.2, color: 'var(--text-primary)' }}>{user.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem', borderRadius: '8px' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </>
          )}

        </div>

      </div>
    </nav>
  );
};
