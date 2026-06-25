import React from 'react';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../ui/NotificationBell';

const Topbar = ({ toggleSidebar, isMobile }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-background-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 transition-colors duration-200">
      <div className="flex items-center">
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-text-dark dark:text-text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition md:hidden"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-text-dark dark:text-text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <NotificationBell />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-dark dark:text-text-light leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role}
            </p>
          </div>
          <Link to="/app/profile" className="w-9 h-9 rounded-full bg-brand-navy dark:bg-brand-slate text-white flex items-center justify-center font-medium border border-accent-gold/50 hover:opacity-80 transition-opacity overflow-hidden">
            {user?.profilePhoto ? (
              <img src={`${import.meta.env.VITE_API_URL || ''}${user.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`
            )}
          </Link>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
