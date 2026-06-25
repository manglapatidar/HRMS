import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Briefcase, Plus, X, Clock, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';

const AdminLeaveView = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/admin/all');
      setLeaves(res.data || []);
    } catch (error) {
      console.error('Failed to fetch admin leaves', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApproval = async (id, status) => {
    try {
      await api.put(`/approvals/${id}`, { status });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
          <Calendar size={24} className="text-accent-gold" />
          Company Leave Requests
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and manage leave applications for all employees.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Days</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading company leaves...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No leave requests found.</td>
                </tr>
              ) : (
                leaves.map((req) => {
                  const startDate = new Date(req.details.startDate).toLocaleDateString();
                  const endDate = new Date(req.details.endDate).toLocaleDateString();
                  
                  let statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
                  if (req.status === 'Approved') statusColor = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
                  if (req.status === 'Rejected' || req.status === 'Cancelled') statusColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';

                  return (
                    <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-dark dark:text-text-light">
                          {req.requesterId?.firstName} {req.requesterId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{req.requesterId?.employeeId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-text-dark dark:text-text-light">
                          {startDate} {startDate !== endDate && `to ${endDate}`}
                        </div>
                        {req.details.isHalfDay && <span className="text-xs text-accent-gold font-medium">Half Day</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {req.details.isHalfDay ? 0.5 : Math.ceil((new Date(req.details.endDate) - new Date(req.details.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {req.comments}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          {req.status === 'Manager Approved — Pending HR' ? 'Pending HR' : req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApproval(req._id, 'Approved')}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleApproval(req._id, 'Rejected')}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Leave = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    comments: ''
  });

  if (user?.role === 'HR Admin' || user?.role === 'Leadership') {
    return <AdminLeaveView />;
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const [balRes, histRes, polRes] = await Promise.all([
        api.get('/leaves/balance'),
        api.get('/leaves/my-requests'),
        api.get('/leaves/policies')
      ]);
      setBalances(balRes.data || []);
      setHistory(histRes.data || []);
      setPolicies(polRes.data || []);
      
      // Auto-select first leave type if available
      if (polRes.data && polRes.data.length > 0 && !formData.leaveTypeId) {
        setFormData(prev => ({ ...prev, leaveTypeId: polRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Failed to fetch leave data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    if (formData.isHalfDay) return 0.5;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    
    // Simple inclusive difference
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySuccess('');
    
    const requestedDays = calculateDays();
    if (requestedDays <= 0) {
      return setApplyError('Invalid date range');
    }

    // Client-side balance validation
    const selectedPolicy = policies.find(p => p._id === formData.leaveTypeId);
    if (selectedPolicy && selectedPolicy.requiresBalance) {
      const selectedBalance = balances.find(b => b.leaveTypeId._id === formData.leaveTypeId);
      if (selectedBalance && requestedDays > selectedBalance.balance) {
        return setApplyError(`Insufficient balance. You only have ${selectedBalance.balance} days available.`);
      }
    }

    setIsSubmitting(true);
    try {
      await api.post('/leaves/apply', formData);
      setApplySuccess('Leave request submitted successfully!');
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setApplySuccess('');
        setFormData({
          leaveTypeId: policies[0]?._id || '',
          startDate: '',
          endDate: '',
          isHalfDay: false,
          comments: ''
        });
        fetchData(); // Refresh data
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    
    try {
      await api.patch(`/leaves/${id}/cancel`);
      fetchData(); // Refresh to show cancelled status and updated balance
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Calendar size={24} className="text-accent-gold" />
            Leave Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View your leave balances, request time off, and track history.</p>
        </div>
        
        <button 
          onClick={() => setIsApplyModalOpen(true)}
          className="bg-accent-gold text-brand-navy font-bold px-4 py-2 rounded-md hover:bg-accent-bronze hover:text-white transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Apply for Leave
        </button>
      </div>

      {/* Leave Balances */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light mb-4">My Leave Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full p-8 text-center text-gray-500">Loading leave balances...</div>
          ) : balances.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark">No leave balances found.</div>
          ) : (
            balances.map((balance, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={balance._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Briefcase size={64} className="text-accent-gold" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-1 relative z-10">
                  {balance.leaveTypeId?.name || 'Leave Type'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 relative z-10">
                  {balance.leaveTypeId?.isPaid ? 'Paid Time Off' : 'Unpaid Time Off'}
                </p>
                
                <div className="flex items-end gap-2 relative z-10">
                  <span className="text-4xl font-serif font-bold text-brand-navy dark:text-white">
                    {balance.balance}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 pb-1">days available</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex justify-between text-sm relative z-10">
                  <span className="text-gray-500 dark:text-gray-400">Total: {balance.total}</span>
                  <span className="text-gray-500 dark:text-gray-400">Used: {balance.used}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Leave History */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light mb-4">My Leave History</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Days</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Approver</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading history...</td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No leave requests found.</td>
                  </tr>
                ) : (
                  history.map((req) => {
                    const startDate = new Date(req.details.startDate).toLocaleDateString();
                    const endDate = new Date(req.details.endDate).toLocaleDateString();
                    
                    let statusColor = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
                    if (req.status === 'Approved') statusColor = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
                    if (req.status === 'Rejected' || req.status === 'Cancelled') statusColor = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';

                    const canCancel = (req.status === 'Pending') || (req.status === 'Approved' && new Date(req.details.startDate) > new Date());

                    return (
                      <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-text-dark dark:text-text-light">
                            {startDate} {startDate !== endDate && `to ${endDate}`}
                          </div>
                          {req.details.isHalfDay && <span className="text-xs text-accent-gold font-medium">Half Day</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {req.details.isHalfDay ? 0.5 : Math.ceil((new Date(req.details.endDate) - new Date(req.details.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {req.comments}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {req.approverId ? `${req.approverId.firstName} ${req.approverId.lastName}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                            {req.status === 'Manager Approved — Pending HR' ? 'Pending HR' : req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {canCancel && (
                            <button 
                              onClick={() => handleCancelLeave(req._id)}
                              className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  Apply for Leave
                </h3>
                <button onClick={() => setIsApplyModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {applySuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                      <Check size={32} />
                    </div>
                    <p className="text-lg font-medium text-text-dark dark:text-text-light">{applySuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleApplyLeave} className="space-y-4">
                    {applyError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <XCircle size={16} />
                        {applyError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type *</label>
                      <select 
                        required
                        value={formData.leaveTypeId}
                        onChange={(e) => setFormData({...formData, leaveTypeId: e.target.value})}
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      >
                        <option value="" disabled>Select a leave type</option>
                        {policies.map(p => {
                          const bal = balances.find(b => b.leaveTypeId?._id === p._id);
                          const balText = p.requiresBalance ? `(${bal ? bal.balance : 0} days available)` : '(Unlimited)';
                          return (
                            <option key={p._id} value={p._id} className="dark:bg-gray-800">
                              {p.name} {balText}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                        <input 
                          required 
                          type="date" 
                          name="startDate" 
                          value={formData.startDate} 
                          onChange={handleInputChange} 
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                        <input 
                          required 
                          type="date" 
                          name="endDate" 
                          value={formData.endDate} 
                          onChange={handleInputChange} 
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold" 
                        />
                      </div>
                    </div>

                    {formData.startDate && formData.endDate && formData.startDate === formData.endDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="isHalfDay" 
                          name="isHalfDay" 
                          checked={formData.isHalfDay} 
                          onChange={handleInputChange} 
                          className="rounded text-accent-gold focus:ring-accent-gold"
                        />
                        <label htmlFor="isHalfDay" className="text-sm text-gray-700 dark:text-gray-300">This is a half-day leave</label>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex justify-between">
                        <span>Reason / Comments *</span>
                        <span className="text-accent-gold font-semibold">{calculateDays()} Day(s) Requested</span>
                      </label>
                      <textarea 
                        required 
                        name="comments" 
                        value={formData.comments} 
                        onChange={handleInputChange} 
                        rows="3"
                        placeholder="Please provide a brief reason for your leave..."
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold resize-none" 
                      />
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                      <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">
                        Cancel
                      </button>
                      <button disabled={isSubmitting} type="submit" className="bg-accent-gold hover:bg-accent-bronze text-brand-navy hover:text-white px-4 py-2 rounded-md transition-colors shadow-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leave;
