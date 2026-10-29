import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle, Clock, AlertTriangle, Download, 
  PlusCircle, Search, ShieldCheck, QrCode, Receipt, X, Printer
} from 'lucide-react';
import { feeService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const FeeTrackerPage = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ total_due: 0, total_paid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal state
  const [payingFee, setPayingFee] = useState(null);
  const [payMethod, setPayMethod] = useState('UPI');
  const [processingPay, setProcessingPay] = useState(false);
  const [paySuccess, setPaySuccess] = useState('');

  // Receipt Modal state
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Warden Issue Fee Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [issueData, setIssueData] = useState({
    student_id: '',
    fee_type: 'Late Entry Fine',
    amount: '',
    due_date: '',
    notes: ''
  });
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const isWarden = user?.role === 'warden';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    loadFees();
    if (isWarden) {
      loadStudents();
    }
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      if (isWarden) {
        const res = await feeService.getAll();
        setFees(res.data.fees);
        setSummary({
          total_collected: res.data.total_collected,
          total_pending: res.data.total_pending,
          total_overdue: res.data.total_overdue,
          overdue_count: res.data.overdue_count
        });
      } else {
        const res = await feeService.getMyFees();
        setFees(res.data.fees);
        setSummary({
          total_due: res.data.total_due,
          total_paid: res.data.total_paid
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const res = await adminService.getStudents();
      setStudents(res.data.students);
      if (res.data.students.length > 0) {
        setIssueData(prev => ({ ...prev, student_id: res.data.students[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!payingFee) return;
    setProcessingPay(true);

    try {
      // Simulate brief network gateway processing
      await new Promise(r => setTimeout(r, 800));
      const res = await feeService.pay({ fee_id: payingFee.id, payment_method: payMethod });
      setPaySuccess(`Payment of ₹${payingFee.amount} successfully processed! Receipt generated.`);
      setPayingFee(null);
      loadFees();
      setTimeout(() => setPaySuccess(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setProcessingPay(false);
    }
  };

  const handleIssueFee = async (e) => {
    e.preventDefault();
    setSubmittingIssue(true);
    try {
      await feeService.issue(issueData);
      setShowIssueModal(false);
      setIssueData({
        student_id: students[0]?.id || '',
        fee_type: 'Late Entry Fine',
        amount: '',
        due_date: '',
        notes: ''
      });
      loadFees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue fine');
    } finally {
      setSubmittingIssue(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            PAID
          </span>
        );
      case 'Pending':
        return (
          <span style={{
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#F59E0B',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            DUE
          </span>
        );
      case 'Overdue':
        return (
          <span style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            OVERDUE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1050px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
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
              <CreditCard size={22} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Hostel Fees, Dues & Fine Tracker
            </h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {isWarden ? 'Hostel billing overview, penalty fine issuance, and fee collection receipts.' : 'Track semester room rent, mess charges, penalty fines, and instant digital payments.'}
          </p>
        </div>

        {isWarden && (
          <button 
            onClick={() => setShowIssueModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> Issue Fee / Fine
          </button>
        )}
      </div>

      {paySuccess && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} /> {paySuccess}
        </div>
      )}

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {isWarden ? (
          <>
            <div className="card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>Total Collected</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{summary.total_collected?.toLocaleString() || 0}
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>Outstanding Pending</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{summary.total_pending?.toLocaleString() || 0}
              </div>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase' }}>Overdue Penalty Dues</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{summary.total_overdue?.toLocaleString() || 0}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>Total Dues Pending</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{summary.total_due?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Clear dues to maintain active gate pass eligibility</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase' }}>Total Paid to Date</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                ₹{summary.total_paid?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>All transactions verified & digital receipts issued</div>
            </div>
          </>
        )}
      </div>

      {/* Dues & Transactions Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          {isWarden ? 'All Hostel Billing Records' : 'Fee Invoices & Payment History'}
        </h2>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading billing records...</div>
        ) : fees.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No fee or fine records logged.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Receipt #</th>
                  {isWarden && <th style={{ padding: '0.75rem 1rem' }}>Student</th>}
                  <th style={{ padding: '0.75rem 1rem' }}>Fee Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#818CF8' }}>
                      {f.receipt_no}
                    </td>

                    {isWarden && (
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {f.student_name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.hostel_block} • {f.room_number}</div>
                      </td>
                    )}

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.fee_type}</div>
                      {f.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {f.notes}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      ₹{f.amount.toLocaleString()}
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {f.due_date}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(f.status)}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {f.status !== 'Paid' && isStudent && (
                          <button
                            onClick={() => setPayingFee(f)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#10B981', borderColor: '#059669' }}
                          >
                            Pay Now
                          </button>
                        )}

                        {f.status === 'Paid' && (
                          <button
                            onClick={() => setViewingReceipt(f)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Receipt size={13} /> View Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Fee Modal */}
      {payingFee && (
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
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Hostel Payment Gateway
              </h3>
              <button 
                onClick={() => setPayingFee(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment For</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{payingFee.fee_type}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', marginTop: '0.35rem' }}>
                ₹{payingFee.amount.toLocaleString()}
              </div>
            </div>

            <form onSubmit={handlePay}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Select Payment Mode
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, Paytm QR)' },
                  { id: 'Debit Card', label: 'Debit / ATM Card (Visa / Mastercard / RuPay)' },
                  { id: 'Net Banking', label: 'Online Net Banking (SBI, HDFC, ICICI, Axis)' }
                ].map(mode => (
                  <label
                    key={mode.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid ' + (payMethod === mode.id ? '#6366F1' : 'var(--border-subtle)'),
                      backgroundColor: payMethod === mode.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-app)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={mode.id}
                      checked={payMethod === mode.id}
                      onChange={() => setPayMethod(mode.id)}
                    />
                    {mode.label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPayingFee(null)}
                  className="btn btn-secondary"
                  disabled={processingPay}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processingPay}
                  style={{ backgroundColor: '#10B981', borderColor: '#059669' }}
                >
                  {processingPay ? 'Authorizing Payment...' : `Confirm Pay ₹${payingFee.amount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {viewingReceipt && (
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
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setViewingReceipt(null)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            {/* Official Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #E2E8F0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>ResQHub Hostel Administration</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '2px' }}>OFFICIAL E-RECEIPT & PAYMENT ACKNOWLEDGMENT</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#4F46E5', marginTop: '6px' }}>
                RECEIPT NO: {viewingReceipt.receipt_no}
              </div>
            </div>

            {/* Receipt Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Student Name</span>
                <strong>{viewingReceipt.student_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Room & Block</span>
                <strong>{viewingReceipt.hostel_block} • {viewingReceipt.room_number}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Payment Date</span>
                <span>{new Date(viewingReceipt.paid_at || viewingReceipt.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Payment Method</span>
                <span>{viewingReceipt.payment_method || 'Online Banking'}</span>
              </div>
              {viewingReceipt.transaction_id && (
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Transaction ID</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{viewingReceipt.transaction_id}</span>
                </div>
              )}
            </div>

            {/* Amount line */}
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{viewingReceipt.fee_type}</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
                ₹{viewingReceipt.amount.toLocaleString()}
              </span>
            </div>

            {/* Footer stamp */}
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
              ✓ System generated digitally verified payment receipt. No physical signature required.
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Printer size={15} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warden Issue Fine Modal */}
      {showIssueModal && (
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
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Issue Dues / Penalty Fine
            </h3>

            <form onSubmit={handleIssueFee}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Target Student
                </label>
                <select
                  className="form-control"
                  value={issueData.student_id}
                  onChange={(e) => setIssueData({ ...issueData, student_id: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.hostel_block} - {s.room_number})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Fee / Fine Category
                </label>
                <select
                  className="form-control"
                  value={issueData.fee_type}
                  onChange={(e) => setIssueData({ ...issueData, fee_type: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="Late Entry Fine">Late Curfew Entry Fine</option>
                  <option value="Damage Penalty">Hostel Asset Damage Penalty</option>
                  <option value="Hostel Room Rent (Semester 2)">Hostel Room Rent (Semester 2)</option>
                  <option value="Mess Dues (Monthly)">Mess Dues (Monthly)</option>
                  <option value="Unauthorized Appliance Penalty">Unauthorized High-Watt Appliance Penalty</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250"
                    className="form-control"
                    value={issueData.amount}
                    onChange={(e) => setIssueData({ ...issueData, amount: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={issueData.due_date}
                    onChange={(e) => setIssueData({ ...issueData, due_date: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Violation Details / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Return logged at 10:20 PM without Gate Pass..."
                  className="form-control"
                  value={issueData.notes}
                  onChange={(e) => setIssueData({ ...issueData, notes: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="btn btn-secondary"
                  disabled={submittingIssue}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingIssue}
                >
                  {submittingIssue ? 'Issuing...' : 'Issue Dues Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
