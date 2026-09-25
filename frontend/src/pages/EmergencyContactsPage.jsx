import React from 'react';
import { PhoneCall, HeartPulse, ShieldAlert, Flame, Wrench, Headphones, Building } from 'lucide-react';

const emergencyContacts = [
  {
    role: 'Hostel Chief Warden',
    name: 'Dr. Rajesh Sharma',
    phone: '+91 98765 43210',
    available: '24x7 Emergency Contact',
    icon: Building,
    color: '#EF4444',
    ext: 'Ext 100'
  },
  {
    role: 'Campus Medical Center & Ambulance',
    name: 'Emergency Health Clinic',
    phone: '+91 98765 00002',
    available: '24x7 Ambulance & Doctor on call',
    icon: HeartPulse,
    color: '#10B981',
    ext: 'Ext 108'
  },
  {
    role: 'Hostel Security Control Room',
    name: 'Main Gate Patrol Crew',
    phone: '+91 98765 00001',
    available: '24x7 Security & Guard Dispatch',
    icon: ShieldAlert,
    color: '#3B82F6',
    ext: 'Ext 101'
  },
  {
    role: 'Fire Hazard & Evacuation Team',
    name: 'Campus Disaster Response',
    phone: '+91 98765 00099',
    available: 'Immediate Fire Brigade & Smoke Control',
    icon: Flame,
    color: '#F97316',
    ext: 'Ext 102'
  },
  {
    role: 'Electrical Breakdown Hotline',
    name: 'High Voltage & Power Maintenance',
    phone: '+91 98765 00003',
    available: 'Electrical shock, short-circuit, sparks',
    icon: Wrench,
    color: '#FBBF24',
    ext: 'Ext 104'
  },
  {
    role: 'Student Wellbeing & Counseling Helpline',
    name: 'Campus Counseling Cell',
    phone: '+91 98765 00005',
    available: 'Mon-Sun: 8:00 AM - 10:00 PM',
    icon: Headphones,
    color: '#8B5CF6',
    ext: 'Ext 115'
  }
];

export const EmergencyContactsPage = () => {
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '960px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '9999px',
          background: 'var(--emergency-light)',
          color: '#F87171',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '0.75rem'
        }}>
          <PhoneCall size={14} /> 24X7 DIRECTORY
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF' }}>
          Hostel Emergency Contact Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Direct hotlines for instant contact during safety, medical, or facility emergencies
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {emergencyContacts.map((contact, idx) => {
          const Icon = contact.icon;
          return (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: `${contact.color}20`,
                    color: contact.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {contact.ext}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: contact.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {contact.role}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {contact.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  {contact.available}
                </p>
              </div>

              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  borderColor: contact.color
                }}
              >
                <PhoneCall size={16} color={contact.color} />
                {contact.phone}
              </a>
            </div>
          );
        })}
      </div>

    </div>
  );
};
