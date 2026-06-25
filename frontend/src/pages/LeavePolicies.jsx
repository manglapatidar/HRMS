import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, Plus, Edit2, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const LeavePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    isPaid: true,
    requiresBalance: true,
    annualAllowance: 0,
    carryForwardLimit: 0,
    colorTag: '#3B82F6',
  });

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/leaves/policies');
      setPolicies(res.data);
    } catch (error) {
      console.error('Failed to fetch policies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (policy = null) => {
    if (policy) {
      setFormData({
        _id: policy._id,
        name: policy.name,
        isPaid: policy.isPaid,
        requiresBalance: policy.requiresBalance,
        annualAllowance: policy.annualAllowance,
        carryForwardLimit: policy.carryForwardLimit,
        colorTag: policy.colorTag || '#3B82F6',
      });
    } else {
      setFormData({
        _id: '',
        name: '',
        isPaid: true,
        requiresBalance: true,
        annualAllowance: 12,
        carryForwardLimit: 0,
        colorTag: '#3B82F6',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/leaves/policies', formData);
      setIsModalOpen(false);
      fetchPolicies();
    } catch (error) {
      console.error('Failed to save policy', error);
      toast.error('Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackfill = async () => {
    if (!window.confirm('This will create missing leave balances for all active employees based on the current policies. Continue?')) return;
    setBackfilling(true);
    try {
      const res = await api.post('/leaves/policies/backfill');
      toast.success(res.data.message);
    } catch (error) {
      console.error('Failed to backfill balances', error);
      toast.error('Failed to backfill balances');
    } finally {
      setBackfilling(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Shield size={24} className="text-accent-gold" />
            Leave Policies
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure company-wide leave types and annual allowances.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={async () => {
              if (window.confirm('Run year-end carry forward? This will reset all active employee leave balances.')) {
                try {
                  const res = await api.post('/leaves/policies/carry-forward');
                  toast.success(res.data.message);
                } catch (error) {
                  toast.error('Error running carry-forward');
                }
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm text-sm font-medium"
          >
            Run Year-End Carry Forward
          </button>
          <button 
            onClick={handleBackfill}
            disabled={backfilling}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={backfilling ? "animate-spin" : ""} />
            Recalculate & Backfill
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-brand-navy hover:bg-brand-slate text-white px-4 py-2 rounded-md transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={16} />
            Add Policy
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Is Paid</th>
                <th className="px-6 py-4">Requires Balance</th>
                <th className="px-6 py-4">Annual Allowance</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading policies...</td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No policies found.</td>
                </tr>
              ) : (
                policies.map((policy, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={policy._id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: policy.colorTag || '#3B82F6' }}></span>
                        <span className="font-medium text-text-dark dark:text-text-light">{policy.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {policy.isPaid ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {policy.requiresBalance ? 'Yes' : 'No (Unlimited)'}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {policy.requiresBalance ? `${policy.annualAllowance} days` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => openModal(policy)}
                        className="text-gray-500 hover:text-accent-gold transition-colors p-1"
                        title="Edit Policy"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  {formData._id ? 'Edit Policy' : 'Add New Policy'}
                </h3>
              </div>

              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" placeholder="e.g. Casual, Sick" />
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} className="rounded text-accent-gold focus:ring-accent-gold" />
                      Is Paid Leave?
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input type="checkbox" name="requiresBalance" checked={formData.requiresBalance} onChange={handleInputChange} className="rounded text-accent-gold focus:ring-accent-gold" />
                      Requires Balance?
                    </label>
                  </div>

                  {formData.requiresBalance && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Annual Allowance (Days) *</label>
                        <input required type="number" min="0" step="0.5" name="annualAllowance" value={formData.annualAllowance} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carry Forward Limit (Days)</label>
                        <input type="number" min="0" step="0.5" name="carryForwardLimit" value={formData.carryForwardLimit} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Tag</label>
                    <div className="flex items-center gap-3">
                      <input type="color" name="colorTag" value={formData.colorTag} onChange={handleInputChange} className="h-10 w-14 rounded cursor-pointer border border-border-light dark:border-border-dark" />
                      <span className="text-sm text-gray-500 font-mono uppercase">{formData.colorTag}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">
                      Cancel
                    </button>
                    <button disabled={isSubmitting} type="submit" className="bg-brand-navy hover:bg-brand-slate text-white px-4 py-2 rounded-md transition-colors shadow-sm font-medium disabled:opacity-70">
                      {isSubmitting ? 'Saving...' : 'Save Policy'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeavePolicies;
