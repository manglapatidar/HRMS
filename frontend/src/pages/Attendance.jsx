import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Plus, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Regularization state
  const [isRegularizeModalOpen, setIsRegularizeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regularizeError, setRegularizeError] = useState('');
  const [regularizeSuccess, setRegularizeSuccess] = useState('');
  const [regularizeForm, setRegularizeForm] = useState({
    date: '',
    punchInTime: '09:00',
    punchOutTime: '18:00',
    comments: ''
  });

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegularizeError('');
    setRegularizeSuccess('');
    try {
      await api.post('/attendance/regularize', regularizeForm);
      setRegularizeSuccess('Regularization request submitted successfully!');
      setTimeout(() => {
        setIsRegularizeModalOpen(false);
        setRegularizeSuccess('');
        setRegularizeForm({ date: '', punchInTime: '09:00', punchOutTime: '18:00', comments: '' });
      }, 2000);
    } catch (err) {
      setRegularizeError(err.response?.data?.message || 'Failed to submit regularization request');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // Always fetch personal records for the logged-in user, regardless of role
        const endpoint = '/attendance/my-records';
        
        const res = await api.get(endpoint);
        setRecords(res.data.records || res.data || []);
      } catch (error) {
        console.error('Failed to fetch attendance', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [user.role]);

  // Since we're displaying only personal records, no filtering is needed
  const filteredRecords = records;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Clock size={24} className="text-accent-gold" />
            Attendance Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your recent attendance history.
          </p>
        </div>

        <button 
          onClick={() => setIsRegularizeModalOpen(true)}
          className="bg-accent-gold text-brand-navy font-bold px-4 py-2 rounded-md hover:bg-accent-bronze hover:text-white transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Request Regularization
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Punch In</th>
                <th className="px-6 py-4">Punch Out</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading attendance...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No attendance records found.</td>
                </tr>
              ) : (
                filteredRecords.map((record, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={record._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-text-dark dark:text-text-light font-medium">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {record.punchInTime ? new Date(record.punchInTime).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {record.punchOutTime ? new Date(record.punchOutTime).toLocaleTimeString() : '--:--'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        record.status === 'Present' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Regularization Request Modal */}
      <AnimatePresence>
        {isRegularizeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  Request Regularization
                </h3>
                <button onClick={() => setIsRegularizeModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {regularizeSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-lg font-medium text-text-dark dark:text-text-light">{regularizeSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegularizeSubmit} className="space-y-4">
                    {regularizeError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <ShieldAlert size={16} />
                        {regularizeError}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date *</label>
                      <input 
                        required 
                        type="date" 
                        name="date" 
                        max={new Date().toISOString().split('T')[0]}
                        value={regularizeForm.date} 
                        onChange={(e) => setRegularizeForm({...regularizeForm, date: e.target.value})} 
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Punch In Time *</label>
                        <input 
                          required 
                          type="time" 
                          name="punchInTime" 
                          value={regularizeForm.punchInTime} 
                          onChange={(e) => setRegularizeForm({...regularizeForm, punchInTime: e.target.value})} 
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Punch Out Time *</label>
                        <input 
                          required 
                          type="time" 
                          name="punchOutTime" 
                          value={regularizeForm.punchOutTime} 
                          onChange={(e) => setRegularizeForm({...regularizeForm, punchOutTime: e.target.value})} 
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Comments *</label>
                      <textarea 
                        required 
                        rows="3"
                        placeholder="Please explain why you need regularization (e.g., forgot to punch in, work travel)..."
                        value={regularizeForm.comments} 
                        onChange={(e) => setRegularizeForm({...regularizeForm, comments: e.target.value})} 
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none resize-none" 
                      />
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsRegularizeModalOpen(false)} 
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={isSubmitting} 
                        type="submit" 
                        className="bg-accent-gold hover:bg-accent-bronze text-brand-navy hover:text-white px-4 py-2 rounded-md transition-colors shadow-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                      >
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

export default Attendance;
