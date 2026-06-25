import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Clock, Plus, Trash2, Edit2, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Shifts = () => {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingShift, setEditingShift] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriod: 15,
    isDefault: false
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shifts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openAddModal = () => {
    setEditingShift(null);
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriod: 15,
      isDefault: false
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriod: shift.gracePeriod,
      isDefault: shift.isDefault
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingShift) {
        await api.put(`/shifts/${editingShift._id}`, formData);
        toast.success('Shift updated successfully!');
      } else {
        await api.post('/shifts', formData);
        toast.success('Shift created successfully!');
      }
      
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save shift';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      fetchShifts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete shift');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Clock size={24} className="text-accent-gold" />
            Shift Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure work hours, grace periods, and default shifts for employee late calculations.
          </p>
        </div>
        
        {user?.role === 'HR Admin' && (
          <button 
            onClick={openAddModal}
            className="bg-accent-gold text-brand-navy font-bold px-4 py-2 rounded-md hover:bg-accent-bronze hover:text-white transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Create Shift
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading shift policies...</div>
        ) : shifts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark">
            No shift policies configured. Click "Create Shift" to add the first shift.
          </div>
        ) : (
          shifts.map((shift, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={shift._id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {shift.isDefault && (
                <div className="absolute top-0 right-0 bg-accent-gold text-brand-navy text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Default Shift
                </div>
              )}
              
              <h3 className="text-lg font-semibold text-text-dark dark:text-text-light mb-2 pr-20 truncate">
                {shift.name}
              </h3>
              
              <div className="space-y-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Timings:</span>
                  <span className="font-mono font-medium text-text-dark dark:text-text-light">
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Grace Period:</span>
                  <span className="font-medium text-text-dark dark:text-text-light">
                    {shift.gracePeriod} minutes
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-2">
                <button 
                  onClick={() => openEditModal(shift)}
                  className="p-2 text-gray-500 hover:text-accent-gold hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                  title="Edit Shift"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(shift._id)}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Delete Shift"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Shift Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  {editingShift ? 'Edit Shift Policy' : 'Create Shift Policy'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 flex items-center gap-2 mb-4">
                    <ShieldAlert size={16} />
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift Name *</label>
                      <input 
                        required 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Day Shift, Night Shift"
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time *</label>
                        <input 
                          required 
                          type="time" 
                          name="startTime" 
                          value={formData.startTime} 
                          onChange={handleInputChange} 
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time *</label>
                        <input 
                          required 
                          type="time" 
                          name="endTime" 
                          value={formData.endTime} 
                          onChange={handleInputChange} 
                          className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period (Minutes)</label>
                      <input 
                        type="number" 
                        name="gracePeriod" 
                        value={formData.gracePeriod} 
                        onChange={handleInputChange} 
                        min="0"
                        placeholder="e.g. 15"
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="isDefault" 
                        name="isDefault" 
                        checked={formData.isDefault} 
                        onChange={handleInputChange} 
                        className="rounded border-gray-300 text-accent-gold focus:ring-accent-gold"
                      />
                      <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                        Set as Default Shift for new employees
                      </label>
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={isSubmitting} 
                        type="submit" 
                        className="bg-accent-gold hover:bg-accent-bronze text-brand-navy hover:text-white px-4 py-2 rounded-md transition-colors shadow-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Shift'}
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

export default Shifts;
