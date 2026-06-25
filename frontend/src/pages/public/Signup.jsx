import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { Building2, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/company-signup', formData);
      setSuccess(res.data.message || 'Company registered successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background-light dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden transition-colors duration-200">
        
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent-gold/5 blur-[120px] rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-navy/5 blur-[120px] rounded-tr-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-border-light dark:border-border-dark overflow-hidden relative z-10"
        >
          <div className="bg-brand-navy dark:bg-brand-slate py-8 px-8 md:px-12 text-center border-b border-accent-gold/20">
            <h2 className="text-3xl font-serif font-bold text-white mb-2">Start your free trial</h2>
            <p className="text-gray-300">Set up your company workspace and admin account.</p>
          </div>

          <div className="p-8 md:p-12">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
                <CheckCircle2 className="text-status-success mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">Redirecting to login...</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light border-b border-border-light dark:border-border-dark pb-2">Company Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company ID (Tenant Login)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-mono text-sm">@</span>
                      </div>
                      <input
                        type="text"
                        name="companyId"
                        required
                        pattern="[a-zA-Z0-9-]+"
                        title="Only letters, numbers, and hyphens"
                        value={formData.companyId}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="acmecorp"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be unique, no spaces.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light border-b border-border-light dark:border-border-dark pb-2">HR Admin Account</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="adminFirstName"
                        required
                        value={formData.adminFirstName}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="Jane"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="adminLastName"
                        required
                        value={formData.adminLastName}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="adminEmail"
                        required
                        value={formData.adminEmail}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="admin@acmecorp.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="adminPassword"
                        required
                        minLength="6"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm focus:ring-accent-gold focus:border-accent-gold bg-transparent text-text-dark dark:text-text-light sm:text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || success}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-semibold text-brand-navy bg-accent-gold hover:bg-accent-bronze hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Create Company Workspace'}
                </motion.button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have a workspace?{' '}
              <Link to="/login" className="font-medium text-accent-bronze hover:text-accent-gold transition-colors">
                Log in instead
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default Signup;
