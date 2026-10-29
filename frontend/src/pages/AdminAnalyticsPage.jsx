import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { adminService } from '../services/api';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Generating analytics reports...
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const total = summary.total_complaints || 0;
  const resolved = summary.resolved_complaints || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <BarChart3 size={16} /> METRICS & REPORTING
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
          Hostel Facility & Emergency Analytics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Performance metrics, issue category distributions, and SLA resolution velocity
        </p>
      </div>

      {/* Top High-Level Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Complaints Filed</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.4rem' }}>{total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>All-time registered tickets</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Resolution Efficiency</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10B981', marginTop: '0.4rem' }}>{resolutionRate}%</div>
          <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '0.2rem' }}>{resolved} issues resolved successfully</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Emergency Alerts</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#EF4444', marginTop: '0.4rem' }}>{summary.total_emergencies || 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#F87171', marginTop: '0.2rem' }}>{summary.active_emergencies || 0} currently active</div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Backlog</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.4rem' }}>
            {(summary.pending_complaints || 0) + (summary.in_progress_complaints || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Pending and in progress</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Satisfaction CSAT</div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F59E0B', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            ⭐ {summary.average_rating || 5.0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summary.total_rated || 0} student verified ratings
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Category Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Complaints by Facility Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analytics?.by_category && Object.entries(analytics.by_category).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #4F46E5, #818CF8)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Lifecycle Status Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {analytics?.by_status && Object.entries(analytics.by_status).map(([st, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              let barColor = '#4F46E5';
              if (st === 'Submitted') barColor = '#94A3B8';
              if (st === 'Acknowledged') barColor = '#F59E0B';
              if (st === 'Assigned') barColor = '#8B5CF6';
              if (st === 'In Progress') barColor = '#3B82F6';
              if (st === 'Resolved' || st === 'Closed') barColor = '#10B981';

              return (
                <div key={st}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{st}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
