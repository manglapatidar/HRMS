import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Check, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Approvals = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      const res = await api.get('/approvals/pending');
      setApprovals(res.data || []);
    } catch (error) {
      console.error('Failed to fetch approvals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/approvals/${id}`, { status, comments: `Automatically ${status.toLowerCase()} from dashboard` });
      // Refresh the list
      setApprovals(approvals.filter(app => app._id !== id));
    } catch (error) {
      console.error(`Failed to ${status} request`, error);
      toast.error(`Failed to process request: ${error.response?.data?.message || error.message}`);
    }
  };

  if (user.role === 'Employee') {
    return (
      <div className="p-8 text-center text-gray-500">
        You do not have permission to view pending approvals.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <CheckSquare size={24} className="text-accent-gold" />
            Pending Approvals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review and process requests from your team.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Requester</th>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Requested On</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading pending requests...</td>
                </tr>
              ) : approvals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No pending approvals! You're all caught up.</td>
                </tr>
              ) : (
                approvals.map((req, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={req._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-dark dark:text-text-light">
                        {req.requesterId?.firstName} {req.requesterId?.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {req.requesterId?.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                        <Clock size={12} />
                        {req.type}
                      </span>
                      {req.delegatedFrom && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 ml-2">
                          Delegated from {req.delegatedFrom}
                        </span>
                      )}
                      {req.escalated && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 ml-2">
                          Escalated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {req.type === 'Leave' && req.details ? (
                        <>
                          <div className="font-semibold text-accent-gold">Leave Application</div>
                          <div>From: {new Date(req.details.startDate).toLocaleDateString()}</div>
                          <div>To: {new Date(req.details.endDate).toLocaleDateString()}</div>
                          {req.details.isHalfDay && <div className="text-xs text-accent-bronze font-semibold">Half Day</div>}
                        </>
                      ) : req.type === 'AttendanceRegularization' && req.details ? (
                        <>
                          <div className="font-semibold text-accent-gold">Regularization</div>
                          <div>Date: {new Date(req.details.date).toLocaleDateString()}</div>
                          <div>Correction: <span className="font-mono font-medium">{req.details.punchInTime} - {req.details.punchOutTime}</span></div>
                          <div className="text-xs text-gray-500 mt-1 italic">Reason: {req.comments}</div>
                        </>
                      ) : (
                        req.comments || 'No details provided.'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                      {req.status === 'Manager Approved — Pending HR' && (
                        <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">Pending HR Review</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleAction(req._id, 'Approved')}
                          className="p-1.5 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30 rounded-md transition-colors"
                          title="Approve"
                        >
                          <Check size={20} />
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'Rejected')}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Reject"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Approvals;
