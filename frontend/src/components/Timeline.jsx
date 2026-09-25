import React from 'react';
import { CheckCircle2, Clock, UserCheck, Wrench, ShieldCheck, Check } from 'lucide-react';

const stages = ['Submitted', 'Acknowledged', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export const ComplaintTimeline = ({ currentStatus, history = [] }) => {
  const currentIndex = stages.indexOf(currentStatus);

  const getStageIcon = (stage, idx) => {
    if (idx < currentIndex || currentStatus === 'Resolved' || currentStatus === 'Closed') {
      return <Check size={16} />;
    }
    if (idx === currentIndex) {
      return <Clock size={16} className="animate-spin" />;
    }
    return <span style={{ fontSize: '0.75rem' }}>{idx + 1}</span>;
  };

  return (
    <div style={{ margin: '1.5rem 0' }}>
      {/* Visual Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginBottom: '2rem' }}>
        <div 
          style={{
            position: 'absolute',
            top: '16px',
            left: '20px',
            right: '20px',
            height: '3px',
            backgroundColor: 'var(--border-subtle)',
            zIndex: 1
          }}
        >
          <div 
            style={{
              height: '100%',
              backgroundColor: 'var(--primary)',
              width: currentIndex >= 0 ? `${(currentIndex / (stages.length - 1)) * 100}%` : '0%',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '0.5rem' }}>
              <div 
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted ? 'var(--primary)' : 'var(--bg-card)',
                  color: isCompleted ? '#FFFFFF' : 'var(--text-muted)',
                  border: isCurrent ? '2px solid #818CF8' : '2px solid var(--border-light)',
                  boxShadow: isCurrent ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {getStageIcon(stage, idx)}
              </div>
              <span 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#FFFFFF' : isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                  textAlign: 'center'
                }}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Audit Trail & History
          </h4>
          <div className="timeline">
            {history.map((item, idx) => (
              <div key={item.id || idx} className="timeline-item">
                <div className={`timeline-dot ${idx === 0 ? 'active' : ''}`} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      Status set to: <span style={{ color: '#818CF8' }}>{item.new_status}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by {item.changed_by_name} ({item.changed_by_role})
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                  {item.remarks && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--border-light)' }}>
                      "{item.remarks}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
