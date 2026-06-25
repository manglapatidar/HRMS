import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Clock, CheckSquare, UserCircle, BarChart3, PieChart, Home, X, Shield, Network, Building, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_CONFIG = {
  Employee: [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/app/attendance', icon: Clock },
    { name: 'My Leave', path: '/app/leave', icon: Calendar },
    { name: 'Holidays', path: '/app/holidays', icon: Calendar },
    { name: 'My Profile', path: '/app/profile', icon: UserCircle },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ],
  Manager: [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/app/attendance', icon: Clock },
    { name: 'My Leave', path: '/app/leave', icon: Calendar },
    { name: 'Team Directory', path: '/app/team-directory', icon: Users },
    { name: 'Approvals', path: '/app/approvals', icon: CheckSquare },
    { name: 'Attendance Register', path: '/app/attendance-register', icon: Clock },
    { name: 'Holidays', path: '/app/holidays', icon: Calendar },
    { name: 'Team Reports', path: '/app/team-reports', icon: BarChart3 },
    { name: 'My Profile', path: '/app/profile', icon: UserCircle },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ],
  Leadership: [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/app/attendance', icon: Clock },
    { name: 'Workforce Analytics', path: '/app/workforce-analytics', icon: PieChart },
    { name: 'Org Directory', path: '/app/org-directory', icon: Users },
    { name: 'Attendance Register', path: '/app/attendance-register', icon: Clock },
    { name: 'Holidays', path: '/app/holidays', icon: Calendar },
    { name: 'Company Reports', path: '/app/company-reports', icon: BarChart3 },
    { name: 'My Profile', path: '/app/profile', icon: UserCircle },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ],
  'HR Admin': [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/app/attendance', icon: Clock },
    { name: 'Directory', path: '/app/employees', icon: Users },
    { name: 'Org Chart', path: '/app/org-chart', icon: Network },
    { name: 'Org Setup', path: '/app/org-setup', icon: Building },
    { name: 'Shifts', path: '/app/shifts', icon: Clock },
    { name: 'Leave Policies', path: '/app/leave-policies', icon: Shield },
    { name: 'Holidays', path: '/app/holidays', icon: Calendar },
    { name: 'Approvals', path: '/app/approvals', icon: CheckSquare },
    { name: 'Company Reports', path: '/app/company-reports', icon: BarChart3 },
    { name: 'My Profile', path: '/app/profile', icon: UserCircle },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ]
};

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { user } = useAuth();
  
  const navItems = SIDEBAR_CONFIG[user?.role] || SIDEBAR_CONFIG['Employee'];

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-dark/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-gold text-brand-navy flex items-center justify-center font-bold text-xl">H</div>
          {(!isMobile || isOpen) && <span className="font-serif text-xl tracking-wide">HRCore</span>}
        </div>
        {isMobile && (
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => isMobile && setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center ${(!isMobile && !isOpen) ? 'justify-center' : 'justify-start px-4'} py-3 rounded-md transition-colors ` +
                (isActive 
                  ? 'bg-accent-gold text-brand-navy font-medium' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white')
              }
              title={(!isMobile && !isOpen) ? item.name : ''}
            >
              <Icon size={20} className={(!isMobile && !isOpen) ? '' : 'mr-3'} />
              {(!isMobile && !isOpen) ? null : <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-dark/50 shrink-0">
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-md transition-colors border border-white/10"
        >
          <Home size={18} />
          {(!isMobile && !isOpen) ? null : <span className="font-medium">Back to Home</span>}
        </Link>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }} 
              className="fixed inset-y-0 left-0 w-72 bg-brand-navy dark:bg-brand-slate flex flex-col text-white z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-brand-navy dark:bg-brand-slate transition-all duration-300 flex flex-col text-white z-10 shrink-0`}>
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
