import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Plus, Trash2, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Holidays = () => {
  const { user } = useAuth();
  const isHRAdmin = user?.role === 'HR Admin';

  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get('/holidays');
      setHolidays(res.data || []);
    } catch (err) {
      console.error('Failed to fetch holidays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({ name: '', date: '' });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/holidays', formData);
      setSuccess('Holiday added successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        fetchHolidays();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete holiday');
    }
  };

  // Group holidays by year
  const groupedHolidays = holidays.reduce((acc, curr) => {
    const year = new Date(curr.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(curr);
    return acc;
  }, {});

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Calendar size={24} className="text-accent-gold" />
            Holiday Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View scheduled company holidays and mandatory days off.
          </p>
        </div>
        
        {isHRAdmin && (
          <button 
            onClick={openAddModal}
            className="bg-accent-gold text-brand-navy font-bold px-4 py-2 rounded-md hover:bg-accent-bronze hover:text-white transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            Add Holiday
          </button>
        )}
      </div>

      <div className="space-y-8">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark">
            No holidays configured in the calendar.
          </div>
        ) : (
          Object.keys(groupedHolidays).sort().reverse().map(year => (
            <div key={year} className="space-y-4">
              <h2 className="text-xl font-bold font-serif text-brand-navy dark:text-accent-gold border-b border-border-light dark:border-border-dark pb-2">
                Holidays - {year}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedHolidays[year].map((holiday, idx) => {
                  const holidayDate = new Date(holiday.date);
                  const isPast = holidayDate < new Date().setHours(0,0,0,0);
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={holiday._id} 
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 relative flex justify-between items-center transition-all ${
                        isPast 
                          ? 'border-gray-200 dark:border-gray-700 opacity-60' 
                          : 'border-border-light dark:border-border-dark hover:border-accent-gold/50'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <div className="p-3 rounded-lg bg-accent-gold/10 text-accent-bronze dark:text-accent-gold">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-dark dark:text-text-light">
                            {holiday.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                            {holidayDate.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>

                      {isHRAdmin && (
                        <button 
                          onClick={() => handleDelete(holiday._id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete Holiday"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Holiday Modal */}
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
                  Add New Holiday
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {success ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="text-lg font-medium text-text-dark dark:text-text-light">{success}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
                        <ShieldAlert size={16} />
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Holiday Name *</label>
                      <input 
                        required 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="e.g. New Year's Day"
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                      <input 
                        required 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none" 
                      />
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
                        {isSubmitting ? 'Adding...' : 'Add Holiday'}
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

export default Holidays;
