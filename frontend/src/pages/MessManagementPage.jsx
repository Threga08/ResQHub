import React, { useState, useEffect } from 'react';
import { 
  Utensils, Calendar, Star, Clock, MessageSquare, PlusCircle, 
  CheckCircle, XCircle, AlertCircle, Edit2, X, DollarSign
} from 'lucide-react';
import { messService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MessManagementPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'feedback', 'rebate'
  
  // Menu state
  const [menus, setMenus] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [editItemsText, setEditItemsText] = useState('');

  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackMeal, setFeedbackMeal] = useState('Lunch');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Rebate state
  const [rebates, setRebates] = useState([]);
  const [loadingRebates, setLoadingRebates] = useState(false);
  const [showRebateModal, setShowRebateModal] = useState(false);
  const [rebateData, setRebateData] = useState({ start_date: '', end_date: '', reason: '' });
  const [rebateSuccess, setRebateSuccess] = useState('');

  const isWarden = user?.role === 'warden';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    loadMenu();
    if (activeTab === 'feedback') loadFeedback();
    if (activeTab === 'rebate') loadRebates();
  }, [activeTab]);

  const loadMenu = async () => {
    try {
      setLoadingMenu(true);
      const res = await messService.getMenu();
      setMenus(res.data.menus);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMenu(false);
    }
  };

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const res = await messService.getFeedbacks();
      setFeedbacks(res.data.feedbacks);
      setAvgRating(res.data.average_rating);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const loadRebates = async () => {
    try {
      setLoadingRebates(true);
      const res = isWarden ? await messService.getAllRebates() : await messService.getMyRebates();
      setRebates(res.data.rebates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRebates(false);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    try {
      await messService.updateMenuItem(editingMenuItem.id, { items: editItemsText, timing: editingMenuItem.timing });
      setEditingMenuItem(null);
      loadMenu();
    } catch (err) {
      alert('Failed to update menu item');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await messService.submitFeedback({
        meal_type: feedbackMeal,
        rating: feedbackRating,
        comment: feedbackComment
      });
      setFeedbackSuccess('Feedback recorded! Thank you for helping improve mess meals.');
      setFeedbackComment('');
      loadFeedback();
      setTimeout(() => setFeedbackSuccess(''), 5000);
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  const handleApplyRebate = async (e) => {
    e.preventDefault();
    try {
      await messService.requestRebate(rebateData);
      setRebateSuccess('Mess rebate application submitted to Warden Office.');
      setShowRebateModal(false);
      setRebateData({ start_date: '', end_date: '', reason: '' });
      loadRebates();
      setTimeout(() => setRebateSuccess(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying for rebate');
    }
  };

  const handleRebateStatus = async (id, status) => {
    try {
      await messService.updateRebateStatus(id, status);
      loadRebates();
    } catch (err) {
      alert('Error updating rebate status');
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayMenus = menus.filter(m => m.day_of_week === selectedDay);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1000px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B'
            }}>
              <Utensils size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Mess & Dining Management
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Weekly nutrition schedule, real-time student meal ratings, and leave mess cuts.
          </p>
        </div>

        {isStudent && activeTab === 'rebate' && (
          <button 
            onClick={() => setShowRebateModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> Apply for Mess Rebate
          </button>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        {[
          { key: 'menu', label: 'Weekly Dining Schedule', icon: Calendar },
          { key: 'feedback', label: 'Meal Feedback & Ratings', icon: Star },
          { key: 'rebate', label: 'Mess Rebate & Cuts', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '3px solid #818CF8' : '3px solid transparent',
                color: isActive ? '#818CF8' : 'var(--text-secondary)',
                marginBottom: '-1px'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: WEEKLY MENU */}
      {activeTab === 'menu' && (
        <div>
          {/* Day Selector */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid ' + (selectedDay === day ? '#4F46E5' : 'var(--border-subtle)'),
                  backgroundColor: selectedDay === day ? '#4F46E5' : 'var(--bg-surface)',
                  color: selectedDay === day ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Meals of the Day */}
          {loadingMenu ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading dining schedule...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {dayMenus.map((meal) => (
                <div key={meal.id} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      color: '#818CF8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase'
                    }}>
                      {meal.meal_type}
                    </span>

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} /> {meal.timing}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, minHeight: '50px' }}>
                    {meal.items}
                  </p>

                  {isWarden && (
                    <button
                      onClick={() => {
                        setEditingMenuItem(meal);
                        setEditItemsText(meal.items);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Edit2 size={13} /> Edit Menu Dish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FEEDBACK & RATINGS */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          {/* Average satisfaction header card */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Overall Mess Satisfaction Score
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F59E0B' }}>{avgRating || '4.5'}</span>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill={s <= Math.round(avgRating || 4.5) ? '#F59E0B' : 'transparent'} color="#F59E0B" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on {feedbacks.length} student ratings</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
              Student ratings directly impact catering contractor audit scores and menu revisions.
            </div>
          </div>

          {/* Student Feedback Form */}
          {isStudent && (
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Submit Today's Meal Review
              </h3>

              {feedbackSuccess && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {feedbackSuccess}
                </div>
              )}

              <form onSubmit={handleSubmitFeedback}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Meal
                    </label>
                    <select
                      className="form-control"
                      value={feedbackMeal}
                      onChange={(e) => setFeedbackMeal(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Snacks">Evening Snacks</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Quality Rating
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFeedbackRating(s)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Star size={24} fill={feedbackRating >= s ? '#F59E0B' : 'transparent'} color={feedbackRating >= s ? '#F59E0B' : 'var(--text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Comments / Suggestions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sambhar was very tasty today, but rotis could be softer..."
                    className="form-control"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Submit Rating
                </button>
              </form>
            </div>
          )}

          {/* Feedback Feed */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Recent Student Meal Reviews
            </h3>

            {feedbacks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews recorded yet for today.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.map((f) => (
                  <div key={f.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{f.meal_type}</span>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} fill={s <= f.rating ? '#F59E0B' : 'transparent'} color="#F59E0B" />
                          ))}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.date}</span>
                    </div>
                    {f.comment && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                        "{f.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: MESS REBATE & CUTS */}
      {activeTab === 'rebate' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isWarden ? 'Mess Rebate Applications (All Students)' : 'My Mess Rebate Requests'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Students away on approved leave for 3+ consecutive days are eligible for daily mess fee credit.
              </p>
            </div>
          </div>

          {rebateSuccess && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {rebateSuccess}
            </div>
          )}

          {loadingRebates ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading rebate records...
            </div>
          ) : rebates.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
              No mess rebate requests filed.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {isWarden && <th style={{ padding: '0.75rem 1rem' }}>Student</th>}
                    <th style={{ padding: '0.75rem 1rem' }}>Date Range</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Reason</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    {isWarden && <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {rebates.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {isWarden && (
                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.student_name}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.hostel_block} • {r.room_number}</div>
                        </td>
                      )}
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {r.start_date} <span style={{ color: 'var(--text-muted)' }}>to</span> {r.end_date}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', maxWidth: '280px' }}>
                        {r.reason}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: r.status === 'Approved' ? 'rgba(16, 185, 129, 0.15)' : r.status === 'Rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: r.status === 'Approved' ? '#10B981' : r.status === 'Rejected' ? '#EF4444' : '#F59E0B'
                        }}>
                          {r.status}
                        </span>
                      </td>
                      {isWarden && (
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          {r.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleRebateStatus(r.id, 'Approved')}
                                className="btn btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', backgroundColor: '#10B981', borderColor: '#059669' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRebateStatus(r.id, 'Rejected')}
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#EF4444' }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Menu Modal for Warden */}
      {editingMenuItem && (
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
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Edit Menu: {editingMenuItem.day_of_week} ({editingMenuItem.meal_type})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Timing: {editingMenuItem.timing}
            </p>

            <form onSubmit={handleUpdateMenu}>
              <textarea
                rows={3}
                required
                className="form-control"
                value={editItemsText}
                onChange={(e) => setEditItemsText(e.target.value)}
                style={{ width: '100%', marginBottom: '1.25rem', resize: 'vertical' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingMenuItem(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Rebate Modal */}
      {showRebateModal && (
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
            maxWidth: '480px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Apply for Mess Rebate (Leave Cut)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Specify the leave duration during which you will not be dining in the hostel mess.
            </p>

            <form onSubmit={handleApplyRebate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={rebateData.start_date}
                    onChange={(e) => setRebateData({ ...rebateData, start_date: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={rebateData.end_date}
                    onChange={(e) => setRebateData({ ...rebateData, end_date: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Reason for Absence
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Traveling home for festive break / Medical leave..."
                  className="form-control"
                  value={rebateData.reason}
                  onChange={(e) => setRebateData({ ...rebateData, reason: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRebateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
