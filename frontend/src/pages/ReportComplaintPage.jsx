import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, Upload, X, CheckCircle, ArrowLeft, Image as ImageIcon, 
  AlertCircle, ShieldCheck 
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const categories = [
  'Plumbing', 'Electrical', 'Water', 'Wi-Fi/Internet', 'Furniture', 'Cleaning', 'Other'
];

const priorities = [
  { id: 'Low', label: 'Low', desc: 'Minor inconvenience (can wait 48h)' },
  { id: 'Medium', label: 'Medium', desc: 'Standard repair (24h expectation)' },
  { id: 'High', label: 'High', desc: 'Disruptive issue (urgent same-day fix)' },
  { id: 'Emergency', label: 'Emergency', desc: 'Severe safety hazard' }
];

export const ReportComplaintPage = () => {
  const { user, fetchUnreadCount } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('Electrical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [hostelBlock, setHostelBlock] = useState(user?.hostel_block || 'Block B');
  const [roomNumber, setRoomNumber] = useState(user?.room_number || 'B-204');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.match(/image\/(png|jpeg|jpg|webp)/)) {
      setError('Only JPG, JPEG, PNG, and WEBP image files are allowed');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description of the issue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('hostel_block', hostelBlock);
      formData.append('room_number', roomNumber);
      if (file) {
        formData.append('image', file);
      }

      const res = await complaintService.create(formData);
      if (fetchUnreadCount) fetchUnreadCount();

      // Redirect to complaint detail view
      const newId = res.data.complaint?.id;
      navigate(newId ? `/complaints/${newId}` : '/my-complaints');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '840px' }}>
      
      <Link to="/student" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ background: 'var(--primary-light)', color: '#818CF8', padding: '0.65rem', borderRadius: '10px' }}>
            <Wrench size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF' }}>
              Report Maintenance Issue
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Submit facility or maintenance tickets directly to hostel administration
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--emergency)', color: '#FCA5A5', padding: '0.85rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Issue Category */}
          <div className="form-group">
            <label className="form-label">Issue Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: category === cat ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: category === cat ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-app)',
                    color: category === cat ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label className="form-label">Issue Title / Subject *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Geyser tripping circuit breaker in room B-204"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Provide exact details of the defect, when it started, and specific instructions for the technician..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Location Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hostel Block *</label>
              <input
                type="text"
                className="form-input"
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input
                type="text"
                className="form-input"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Urgency / Priority *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
              {priorities.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    textAlign: 'left',
                    border: priority === p.id ? '2px solid #818CF8' : '1px solid var(--border-subtle)',
                    backgroundColor: priority === p.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-app)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: priority === p.id ? '#FFFFFF' : 'var(--text-secondary)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload Attachment */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Attach Photo Proof (Optional)</label>
            
            {previewUrl ? (
              <div style={{ position: 'relative', width: 'fit-content', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <img src={previewUrl} alt="Preview" style={{ maxHeight: '180px', display: 'block', borderRadius: '8px' }} />
                <button
                  type="button"
                  onClick={removeFile}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#FFFFFF',
                    borderRadius: '50%',
                    padding: '4px',
                    display: 'flex'
                  }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '10px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-app)',
                transition: 'all 0.2s ease'
              }}>
                <Upload size={28} color="var(--text-muted)" />
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Click or drag photo here to upload
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/student')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? 'Submitting Complaint...' : 'Submit Maintenance Ticket'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
