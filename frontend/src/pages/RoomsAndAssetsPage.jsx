import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, CheckCircle2, AlertTriangle, XCircle, Search, 
  Wrench, Users, ShieldCheck, ClipboardCheck, Edit3, X, ArrowRight
} from 'lucide-react';
import { roomService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RoomsAndAssetsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  // Room Assets state
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [inspectingAsset, setInspectingAsset] = useState(null);
  const [inspectCondition, setInspectCondition] = useState('Good');
  const [inspectNotes, setInspectNotes] = useState('');
  const [submittingInspect, setSubmittingInspect] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [selectedBlock]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const res = await roomService.getRooms(selectedBlock !== 'All' ? { block: selectedBlock } : {});
      setRooms(res.data.rooms);

      // Auto-select student's own room if student
      if (user?.room_number && !selectedRoom) {
        const myRoom = res.data.rooms.find(r => r.room_number === user.room_number);
        if (myRoom) {
          handleSelectRoom(myRoom);
        } else if (res.data.rooms.length > 0) {
          handleSelectRoom(res.data.rooms[0]);
        }
      } else if (res.data.rooms.length > 0 && !selectedRoom) {
        handleSelectRoom(res.data.rooms[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    try {
      setLoadingAssets(true);
      const res = await roomService.getAssets(room.room_number);
      setAssets(res.data.assets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleInspectSubmit = async (e) => {
    e.preventDefault();
    if (!inspectingAsset) return;
    setSubmittingInspect(true);

    try {
      await roomService.inspectAsset(inspectingAsset.id, {
        condition: inspectCondition,
        notes: inspectNotes
      });
      setInspectingAsset(null);
      // Reload assets
      const res = await roomService.getAssets(selectedRoom.room_number);
      setAssets(res.data.assets);
    } catch (err) {
      alert('Failed to update asset inspection');
    } finally {
      setSubmittingInspect(false);
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'Good':
        return (
          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle2 size={12} /> Good Condition
          </span>
        );
      case 'Needs Repair':
        return (
          <span style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <AlertTriangle size={12} /> Needs Repair
          </span>
        );
      case 'Damaged':
        return (
          <span style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <XCircle size={12} /> Damaged
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981'
          }}>
            <Home size={22} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Room Allocation & Inventory Checklist
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
          Hostel block directory, resident occupancy status, and room furniture/electrical asset inspection log.
        </p>
      </div>

      {/* Block Filter Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['All', 'Block A', 'Block B'].map((b) => (
          <button
            key={b}
            onClick={() => setSelectedBlock(b)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid ' + (selectedBlock === b ? '#4F46E5' : 'var(--border-subtle)'),
              backgroundColor: selectedBlock === b ? '#4F46E5' : 'var(--bg-surface)',
              color: selectedBlock === b ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Main Two-Column View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Left: Rooms Directory Grid */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Hostel Rooms ({rooms.length})
          </h2>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading rooms...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '540px', overflowY: 'auto' }}>
              {rooms.map((r) => {
                const isSelected = selectedRoom?.room_number === r.room_number;
                const isMyRoom = user?.room_number === r.room_number;
                const isFull = r.occupied_count >= r.capacity;

                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRoom(r)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: '1px solid ' + (isSelected ? '#818CF8' : 'var(--border-subtle)'),
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-app)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? '#818CF8' : 'var(--text-primary)' }}>
                          {r.room_number}
                        </span>
                        {isMyRoom && (
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#4F46E5', color: '#FFFFFF', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                            MY ROOM
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Floor {r.floor} • {r.block}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {r.room_type}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isFull ? '#EF4444' : '#10B981'
                      }}>
                        {r.occupied_count}/{r.capacity} Occupied
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Room Inventory Checklist */}
        {selectedRoom && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase' }}>
                  INVENTORY CHECKLIST
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  Room {selectedRoom.room_number} ({selectedRoom.block})
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Amenities: {selectedRoom.amenities}
                </div>
              </div>

              {/* Raise complaint quick shortcut */}
              <button
                onClick={() => navigate('/report')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Wrench size={13} /> Report Issue
              </button>
            </div>

            {/* Resident occupants */}
            <div style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                Current Residents
              </span>
              {selectedRoom.occupants?.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No students currently assigned to this room.</span>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {selectedRoom.occupants?.map(occ => (
                    <div key={occ.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Users size={14} color="#818CF8" /> {occ.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assets List */}
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Room Asset Items & Condition Status
            </h3>

            {loadingAssets ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assets.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {a.asset_name}
                      </div>
                      {a.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Note: {a.notes}
                        </div>
                      )}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Inspected: {new Date(a.last_inspected_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {getConditionBadge(a.condition)}
                      
                      <button
                        onClick={() => {
                          setInspectingAsset(a);
                          setInspectCondition(a.condition);
                          setInspectNotes(a.notes || '');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Update inspection status"
                      >
                        <Edit3 size={13} /> Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Inspect Asset Condition Modal */}
      {inspectingAsset && (
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
            maxWidth: '460px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Update Asset Condition
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {inspectingAsset.asset_name} • Room {selectedRoom.room_number}
            </p>

            <form onSubmit={handleInspectSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Observed Condition
                </label>
                <select
                  className="form-control"
                  value={inspectCondition}
                  onChange={(e) => setInspectCondition(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Good">Good (Operational & Clean)</option>
                  <option value="Needs Repair">Needs Repair (Minor Fault / Wear)</option>
                  <option value="Damaged">Damaged (Broken / Inoperable)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Inspection Remarks / Maintenance Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified fan speed regulator sparks, reported ticket RH-1001..."
                  className="form-control"
                  value={inspectNotes}
                  onChange={(e) => setInspectNotes(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInspectingAsset(null)}
                  className="btn btn-secondary"
                  disabled={submittingInspect}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingInspect}
                >
                  {submittingInspect ? 'Saving...' : 'Save Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
