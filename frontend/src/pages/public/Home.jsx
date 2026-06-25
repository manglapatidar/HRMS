import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { CheckCircle, Users, Activity, BarChart2, FileText, Lock, Clock, Briefcase, DollarSign, Calendar, Target, TrendingUp, Folder, BookOpen, Zap, Smile } from 'lucide-react';

const FloatingCard = ({ icon: Icon, title, value, color, delay, duration, yRange, xRange, className }) => {
  // Map text color to background color for the glow effect
  const bgColor = color.replace('text-', 'bg-').replace(' dark:text-', ' dark:bg-');
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ delay, duration: 1, ease: "easeOut", type: "spring", stiffness: 50 }}
      className={`absolute ${className} z-10`}
    >
      <motion.div
        animate={{ y: yRange, x: xRange, rotate: [-2, 2, -2] }}
        transition={{ 
          y: { repeat: Infinity, duration, ease: "easeInOut", repeatType: "reverse" },
          x: { repeat: Infinity, duration: duration * 1.2, ease: "easeInOut", repeatType: "reverse" },
          rotate: { repeat: Infinity, duration: duration * 1.5, ease: "easeInOut" }
        }}
        className="relative group cursor-default"
      >
        {/* Pulsing Glow Behind */}
        <div className={`absolute inset-0 rounded-3xl opacity-20 group-hover:opacity-60 blur-xl transition-opacity duration-500 ${bgColor}`}></div>
        
        {/* Glass Card Layout */}
        <div className="relative flex items-center gap-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full p-2 pr-6 shadow-[0_8px_32px_rgba(0,0,0,0.05)] group-hover:border-white/60 dark:group-hover:border-white/20 transition-all duration-300">
          
          {/* Icon Container with animated dashed ring */}
          <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className={`absolute inset-0 rounded-full border border-dashed ${color} opacity-40`}
             />
             <div className={`w-10 h-10 rounded-full bg-white/80 dark:bg-black/40 flex items-center justify-center ${color} shadow-sm backdrop-blur-sm`}>
               <Icon size={18} className="text-current drop-shadow-md" />
             </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <p className="text-xl font-bold text-text-dark dark:text-white leading-none tracking-tight mb-1">{value}</p>
            <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase leading-none">{title}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Home = () => {
  return (
    <AnimatedPage>
      <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[calc(100vh-64px)]">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 50, 0, -50, 0],
              y: [0, 30, -30, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-gold/5 dark:bg-accent-gold/10 blur-[100px]"
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0, 40, 0],
              y: [0, -20, 20, 0],
            }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-navy/5 dark:bg-brand-navy/20 blur-[100px]"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16 py-12">
          
          {/* Left Side: Content */}
          <div className="flex-1 w-full max-w-2xl text-center lg:text-left pt-10 lg:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 text-brand-navy dark:text-accent-gold border border-accent-gold/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
              <span className="text-xs font-semibold tracking-wide uppercase">Multi-Tenant SaaS Platform</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", stiffness: 100 }}
              className="text-5xl md:text-7xl font-serif font-extrabold text-brand-navy dark:text-text-light leading-tight mb-6"
            >
              HR Management,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-bronze">Simplified.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Streamline your organizational processes with premium analytics, seamless attendance tracking, and comprehensive employee self-service.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-accent-gold hover:bg-accent-bronze text-brand-navy font-semibold px-8 py-3 rounded-md shadow-md transition-colors"
                >
                  Start Free Trial &rarr;
                </motion.button>
              </Link>
              <Link to="/features" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-transparent border-2 border-brand-navy/20 dark:border-white/20 text-brand-navy dark:text-white hover:bg-brand-navy/5 dark:hover:bg-white/5 font-semibold px-8 py-3 rounded-md transition-colors"
                >
                  Explore Features
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Floating Stat Cards */}
          <div className="flex-1 w-full h-[500px] relative hidden md:block">
            {/* Center Focal Card */}
            <FloatingCard 
              icon={Activity} 
              title="Live Server Status" 
              value="Optimal" 
              color="text-accent-gold" 
              delay={0.4} 
              duration={4} 
              yRange={[-10, 10]} 
              xRange={[-5, 5]}
              className="top-[35%] left-[25%] z-20 scale-110"
            />
            
            {/* Surrounding Cards */}
            <FloatingCard 
              icon={CheckCircle} 
              title="Leaves Approved" 
              value="2,405" 
              color="text-green-600 dark:text-green-400" 
              delay={0.5} 
              duration={3.5} 
              yRange={[-15, 5]} 
              xRange={[-8, 8]}
              className="top-[5%] left-[45%]"
            />
            
            <FloatingCard 
              icon={Users} 
              title="Active Employees" 
              value="842" 
              color="text-blue-600 dark:text-blue-400" 
              delay={0.6} 
              duration={4.2} 
              yRange={[-5, 15]} 
              xRange={[-10, 5]}
              className="top-[20%] left-[-5%]"
            />
            
            <FloatingCard 
              icon={BarChart2} 
              title="Attendance Rate" 
              value="98.2%" 
              color="text-orange-500 dark:text-orange-400" 
              delay={0.7} 
              duration={3.8} 
              yRange={[-12, 8]} 
              xRange={[0, 10]}
              className="bottom-[10%] left-[10%]"
            />
            
            <FloatingCard 
              icon={FileText} 
              title="Reports Generated" 
              value="15K+" 
              color="text-purple-600 dark:text-purple-400" 
              delay={0.8} 
              duration={4.5} 
              yRange={[-8, 12]} 
              xRange={[-5, 12]}
              className="top-[50%] right-[0%]"
            />

            <FloatingCard 
              icon={Lock} 
              title="MFA Logins" 
              value="100%" 
              color="text-teal-500 dark:text-teal-400" 
              delay={0.9} 
              duration={3.2} 
              yRange={[-10, 10]} 
              xRange={[-10, 0]}
              className="top-[0%] right-[5%]"
            />
            
            <FloatingCard 
              icon={Briefcase} 
              title="Open Positions" 
              value="24" 
              color="text-indigo-500 dark:text-indigo-400" 
              delay={1.0} 
              duration={4.8} 
              yRange={[-12, 10]} 
              xRange={[5, -15]}
              className="bottom-[5%] right-[25%]"
            />

            <FloatingCard 
              icon={DollarSign} 
              title="Payroll Processed" 
              value="$1.2M" 
              color="text-emerald-500 dark:text-emerald-400" 
              delay={1.1} 
              duration={3.6} 
              yRange={[-8, 12]} 
              xRange={[-10, 10]}
              className="top-[80%] left-[5%]"
            />

            <FloatingCard 
              icon={Calendar} 
              title="Upcoming Reviews" 
              value="142" 
              color="text-pink-500 dark:text-pink-400" 
              delay={1.2} 
              duration={4.0} 
              yRange={[-15, 5]} 
              xRange={[-5, 5]}
              className="top-[25%] right-[-5%]"
            />

            <FloatingCard 
              icon={Target} 
              title="Avg. Tenure" 
              value="4.2 yrs" 
              color="text-yellow-600 dark:text-yellow-400" 
              delay={1.3} 
              duration={3.9} 
              yRange={[-10, 15]} 
              xRange={[0, 12]}
              className="bottom-[20%] right-[5%]"
            />

            <FloatingCard 
              icon={TrendingUp} 
              title="Performance" 
              value="+15%" 
              color="text-orange-500 dark:text-orange-400" 
              delay={1.4} 
              duration={4.1} 
              yRange={[-5, 12]} 
              xRange={[-5, 8]}
              className="top-[35%] right-[12%]"
            />

            <FloatingCard 
              icon={Folder} 
              title="Projects Done" 
              value="89" 
              color="text-cyan-500 dark:text-cyan-400" 
              delay={1.5} 
              duration={3.7} 
              yRange={[-15, 8]} 
              xRange={[10, -5]}
              className="bottom-[10%] left-[30%]"
            />

            <FloatingCard 
              icon={BookOpen} 
              title="Learning Hrs" 
              value="2,140" 
              color="text-rose-500 dark:text-rose-400" 
              delay={1.6} 
              duration={4.4} 
              yRange={[-10, 10]} 
              xRange={[-12, 5]}
              className="top-[60%] left-[15%]"
            />

            <FloatingCard 
              icon={Zap} 
              title="System Uptime" 
              value="99.9%" 
              color="text-amber-500 dark:text-amber-400" 
              delay={1.7} 
              duration={3.4} 
              yRange={[-5, 15]} 
              xRange={[5, 15]}
              className="top-[15%] left-[25%]"
            />

            <FloatingCard 
              icon={Smile} 
              title="Satisfaction" 
              value="4.8/5" 
              color="text-emerald-500 dark:text-emerald-400" 
              delay={1.8} 
              duration={4.6} 
              yRange={[-12, 12]} 
              xRange={[-8, 8]}
              className="bottom-[30%] right-[18%]"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Preview Image Section */}
      <div className="relative z-20 container mx-auto px-6 -mt-24 md:-mt-40 mb-32 pointer-events-none flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          className="relative w-full max-w-6xl rounded-2xl md:rounded-3xl border border-white/20 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden bg-[#0A1121] pointer-events-auto"
        >
          {/* Glass glare effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none"></div>
          
          <img 
            src="/dashboard-preview.png" 
            alt="HRCore Dashboard Preview" 
            className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
          />
        </motion.div>
      </div>

      {/* Evolution Section (Redesigned Before/After) */}
      <div className="py-24 bg-brand-navy dark:bg-[#040812] relative border-t border-accent-gold/10">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-accent-gold/10 blur-[120px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold text-white mb-6"
            >
              The Evolution of HR
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto"
            >
              Step away from the fragmented chaos of legacy tools and experience the clarity of a unified, intelligent platform.
            </motion.p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            
            {/* The Old Way */}
            <motion.div 
              initial={{ opacity: 0, x: -20, rotateY: 10 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-5/12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent opacity-50"></div>
              <h3 className="text-xl font-bold text-gray-400 mb-8 uppercase tracking-widest text-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                The Old Way
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="p-4 bg-black/20 rounded-lg border border-white/5 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <p className="text-gray-300 font-medium line-through decoration-red-500/50">Manual spreadsheet tracking</p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg border border-white/5 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <p className="text-gray-300 font-medium line-through decoration-red-500/50">Endless email threads for approvals</p>
                </div>
                <div className="p-4 bg-black/20 rounded-lg border border-white/5 opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <p className="text-gray-300 font-medium line-through decoration-red-500/50">Data silos and compliance risks</p>
                </div>
              </div>
            </motion.div>

            {/* Connecting visual */}
            <div className="hidden lg:flex w-2/12 justify-center items-center relative">
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] z-20"
              >
                <span className="text-brand-navy text-xl font-bold">&rarr;</span>
              </motion.div>
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-gray-700 via-accent-gold/50 to-accent-gold top-1/2 -translate-y-1/2 -z-10"></div>
            </div>

            {/* The HRCore Way */}
            <motion.div 
              initial={{ opacity: 0, x: 20, rotateY: -10 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-5/12 bg-gradient-to-br from-[#0c162c] to-[#080d1a] border-2 border-accent-gold/30 rounded-2xl p-10 relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full blur-2xl"></div>
              
              <h3 className="text-xl font-bold text-accent-gold mb-8 uppercase tracking-widest text-sm flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                With HRCore
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="p-5 bg-white/5 rounded-lg border border-accent-gold/20 hover:bg-white/10 transition-colors duration-300 transform hover:-translate-y-1 cursor-default">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-bold">Automated Workflows</p>
                    <CheckCircle size={16} className="text-accent-gold" />
                  </div>
                  <p className="text-sm text-gray-400">One-click logic replaces manual data entry.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-lg border border-accent-gold/20 hover:bg-white/10 transition-colors duration-300 transform hover:-translate-y-1 cursor-default">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-bold">Self-Service Portal</p>
                    <CheckCircle size={16} className="text-accent-gold" />
                  </div>
                  <p className="text-sm text-gray-400">Empower employees, unburden HR admins.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-lg border border-accent-gold/20 hover:bg-white/10 transition-colors duration-300 transform hover:-translate-y-1 cursor-default">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-bold">Unified Insights</p>
                    <CheckCircle size={16} className="text-accent-gold" />
                  </div>
                  <p className="text-sm text-gray-400">Real-time data across your entire organization.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Features Teaser Section */}
      <div className="py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Animated Background Element */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] border-[100px] border-gray-50/30 dark:border-gray-800/30 rounded-full pointer-events-none"
        />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-16 text-brand-navy dark:text-white"
          >
            Built for Modern Teams
          </motion.h2>
          
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -10, scale: 1.02 }} 
              className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-brand-navy/5 border border-gray-100 dark:border-gray-700 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent-bronze dark:text-accent-gold" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-brand-navy dark:text-white">Centralized Directory</h3>
              <p className="text-gray-500 dark:text-gray-400">Manage all employee data in one secure, isolated tenant database.</p>
            </motion.div>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -10, scale: 1.02 }} 
              className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-brand-navy/5 border border-gray-100 dark:border-gray-700 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-accent-bronze dark:text-accent-gold" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-brand-navy dark:text-white">Automated Attendance</h3>
              <p className="text-gray-500 dark:text-gray-400">Geofenced punch-ins and automated timesheets to track hours precisely.</p>
            </motion.div>
            
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -10, scale: 1.02 }} 
              className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-brand-navy/5 border border-gray-100 dark:border-gray-700 transition-all cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-accent-bronze dark:text-accent-gold" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-brand-navy dark:text-white">Instant Approvals</h3>
              <p className="text-gray-500 dark:text-gray-400">Managers can approve leaves and profile changes with a single click.</p>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/features" className="inline-flex items-center gap-2 mt-16 text-accent-gold hover:text-accent-bronze font-bold text-lg group">
              View all features 
              <motion.span 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                &rarr;
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Screenshot Feature Section */}
      <div className="py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-accent-gold/10 text-accent-gold font-bold text-sm mb-6 border border-accent-gold/20">
                Unmatched Visibility
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy dark:text-white mb-6 leading-tight">
                See exactly what's happening, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-accent-bronze">when it happens.</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                HRCore provides an unparalleled top-down view of your entire organization. Our intuitive interfaces are designed to eliminate guesswork, replacing chaotic spreadsheets with clean, actionable insights. With just a glance, you command full control over your workforce dynamics.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-accent-gold/20 p-1 rounded-full"><CheckCircle size={16} className="text-accent-bronze dark:text-accent-gold" /></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Real-time synchronization across all departments</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-accent-gold/20 p-1 rounded-full"><CheckCircle size={16} className="text-accent-bronze dark:text-accent-gold" /></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Exportable, audit-ready data at your fingertips</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 bg-accent-gold/20 p-1 rounded-full"><CheckCircle size={16} className="text-accent-bronze dark:text-accent-gold" /></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Role-based access controls for absolute security</span>
                </li>
              </ul>
              
              <Link to="/features" className="inline-flex items-center justify-center bg-brand-navy dark:bg-white text-white dark:text-brand-navy font-bold px-8 py-3.5 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                Explore The Platform
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 relative"
            >
              {/* Decorative elements behind image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-accent-gold/5 via-blue-500/5 to-transparent rounded-full blur-[80px] -z-10"></div>
              
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl group">
                <div className="absolute inset-0 bg-brand-navy/0 group-hover:bg-brand-navy/10 transition-colors duration-500 z-10 pointer-events-none"></div>
                <img 
                  src="/platform-screenshot.png" 
                  alt="HRCore Interface Walkthrough" 
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* Floating stat card overlapping image */}
              <motion.div 
                animate={{ y: [-10, 10] }}
                transition={{ repeat: Infinity, duration: 4, repeatType: "reverse", ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white dark:bg-[#111827] p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-4 z-20"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">System Status</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">Fully Optimized</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

    </AnimatedPage>
  );
};

export default Home;
