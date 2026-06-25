import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, AlertCircle, ArrowRight, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [role, setRole] = useState('Employee');
  const [companyId, setCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = ['Employee', 'Manager', 'HR Admin', 'Leadership'];

  const handleRoleChange = (r) => {
    setRole(r);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(companyId, email, password, role);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark transition-colors duration-200 overflow-hidden font-sans">
      {/* Left side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
      >
        <div className="w-full max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between items-center mb-10"
          >
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded bg-brand-navy dark:bg-white text-accent-gold dark:text-brand-navy flex items-center justify-center font-bold text-2xl shadow-md">
                H
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-text-dark dark:text-text-light">
                HRCore
              </h1>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-2 text-text-dark dark:text-text-light">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Please enter your details to sign in.</p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mb-6 p-4 rounded-lg bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 backdrop-blur-sm"
              >
                <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" size={18} />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Role Tabs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-1 mb-8 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700"
          >
            {roles.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`relative flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all z-10 ${
                  role === r 
                    ? 'text-brand-navy dark:text-brand-navy shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {role === r && (
                  <motion.div
                    layoutId="roleTab"
                    className="absolute inset-0 bg-white dark:bg-accent-gold rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{r}</span>
              </button>
            ))}
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-accent-gold">Company ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 size={18} className="text-gray-400 group-focus-within:text-accent-gold transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="block w-full pl-10 px-3 py-3 border border-border-light dark:border-border-dark rounded-lg shadow-sm focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold bg-white dark:bg-[#0A1121] text-text-dark dark:text-text-light transition-all outline-none"
                  placeholder="e.g. democorp01"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-accent-gold">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 group-focus-within:text-accent-gold transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-3 py-3 border border-border-light dark:border-border-dark rounded-lg shadow-sm focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold bg-white dark:bg-[#0A1121] text-text-dark dark:text-text-light transition-all outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-accent-gold">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-accent-gold transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 px-3 py-3 border border-border-light dark:border-border-dark rounded-lg shadow-sm focus:ring-2 focus:ring-accent-gold/50 focus:border-accent-gold bg-white dark:bg-[#0A1121] text-text-dark dark:text-text-light transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-brand-navy bg-gradient-to-r from-accent-gold to-accent-bronze hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold transition-all disabled:opacity-70 mt-4"
            >
              {loading ? 'Authenticating...' : 'Sign in securely'}
              {!loading && <ArrowRight size={18} />}
            </motion.button>
          </motion.form>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8"
          >
            Don't have an account? <Link to="/signup" className="text-accent-gold font-semibold hover:underline">Get started</Link>
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Showcase */}
      <div className="hidden lg:flex w-1/2 bg-brand-navy dark:bg-[#040812] p-12 items-center justify-center relative overflow-hidden">
        {/* Animated Background Gradients */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-gold/10 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]"
        />
        
        {/* Interactive Grid Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="text-5xl font-serif font-bold mb-6 leading-tight text-white">
              Enterprise-grade HR management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-bronze">modern teams.</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              HRCore streamlines your organizational processes with premium analytics, seamless attendance tracking, and intuitive employee self-service.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-6 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-accent-gold/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
                <div className="text-3xl font-serif font-bold text-white">99%</div>
              </div>
              <div className="text-sm text-gray-400 font-medium">Approval efficiency</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: "spring" }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-accent-gold/50 transition-colors mt-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield size={16} className="text-blue-400" />
                </div>
                <div className="text-3xl font-serif font-bold text-white">Zero</div>
              </div>
              <div className="text-sm text-gray-400 font-medium">Payroll errors</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
