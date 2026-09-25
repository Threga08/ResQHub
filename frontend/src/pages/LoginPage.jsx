import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'warden') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'radial-gradient(circle at top, rgba(79, 70, 229, 0.12) 0%, transparent 60%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.25rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #4F46E5 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sign in to access your ResQHub dashboard
          </p>
        </div>

        {/* Demo Account Fill Shortcuts */}
        <div style={{
          background: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Autofill:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => fillDemo('student@resqhub.com', 'Student@123')}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.4rem',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60A5FA',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px'
              }}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemo('warden@resqhub.com', 'Warden@123')}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.4rem',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px'
              }}
            >
              Warden
            </button>
            <button
              type="button"
              onClick={() => fillDemo('staff@resqhub.com', 'Staff@123')}
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.4rem',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#FBBF24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px'
              }}
            >
              Staff
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--emergency)',
            color: '#FCA5A5',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="name@resqhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '1.25rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818CF8', fontWeight: 600 }}>
            Register Student
          </Link>
        </div>

      </div>
    </div>
  );
};
