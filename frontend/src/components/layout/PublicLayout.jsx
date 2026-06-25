import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Check, Crown, Shield, Users, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [footerEmail, setFooterEmail] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'How To Use', path: '/how-to-use' },
    { name: 'Why Us', path: '/why-us' },
  ];

  const handleFooterSubmit = (e) => {
    e.preventDefault();
    if (footerEmail) {
      navigate('/signup', { state: { email: footerEmail } });
    } else {
      navigate('/signup');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light flex flex-col transition-colors duration-200 font-sans">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-accent-gold transform-origin-0 z-50"
        style={{ scaleX }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between transition-colors duration-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-navy dark:bg-white text-accent-gold dark:text-brand-navy flex items-center justify-center font-bold text-xl">
            H
          </div>
          <span className="font-serif text-xl font-bold tracking-wide text-brand-navy dark:text-white">HRCore</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-accent-gold ${isActive ? 'text-accent-gold border-b-2 border-accent-gold pb-1 -mb-[5px]' : 'text-gray-600 dark:text-gray-300'}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Controls - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-dark dark:text-text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <Link to="/app/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-navy hover:bg-opacity-90 dark:bg-white dark:text-brand-navy text-white font-semibold px-5 py-2 rounded-md shadow-sm transition-colors text-sm"
                >
                  Dashboard
                </motion.button>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex items-center gap-1"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-accent-gold transition-colors">
                Log In
              </Link>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent-gold hover:bg-accent-bronze text-brand-navy font-semibold px-5 py-2 rounded-md shadow-sm transition-colors text-sm"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-dark dark:text-text-light hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-text-dark dark:text-text-light hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => 
                    `text-base font-medium py-2 transition-colors ${isActive ? 'text-accent-gold' : 'text-gray-600 dark:text-gray-300 hover:text-accent-gold'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="h-px bg-border-light dark:bg-border-dark my-2"></div>
              {user ? (
                <>
                  <Link 
                    to="/app/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button className="w-full bg-brand-navy text-white font-semibold px-5 py-3 rounded-md shadow-sm transition-colors text-base mt-2">
                      Dashboard
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-medium rounded-md mt-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-medium text-gray-700 dark:text-gray-200 py-2"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <button className="w-full bg-accent-gold hover:bg-accent-bronze text-brand-navy font-semibold px-5 py-3 rounded-md shadow-sm transition-colors text-base mt-2">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy dark:bg-[#060a14] pt-24 pb-12 px-6 relative overflow-hidden border-t border-accent-gold/20">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Top CTA area */}
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-16 mb-16 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-serif font-bold text-white mb-2">Ready to elevate your workforce?</h3>
              <p className="text-gray-400">Join forward-thinking companies streamlining their HR.</p>
            </div>
            <form onSubmit={handleFooterSubmit} className="flex w-full md:w-auto gap-2">
              <input 
                type="email" 
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                placeholder="Enter your work email" 
                required
                className="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-md focus:outline-none focus:border-accent-gold w-full md:w-64"
              />
              <button type="submit" className="bg-accent-gold text-brand-navy font-bold px-6 py-3 rounded-md hover:bg-accent-bronze hover:text-white transition-colors whitespace-nowrap">
                Start Free
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand Column */}
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-2 mb-6 inline-flex">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-gold to-accent-bronze text-brand-navy flex items-center justify-center font-bold text-2xl shadow-lg">
                  H
                </div>
                <span className="font-serif text-2xl font-bold tracking-wide text-white">HRCore</span>
              </Link>
              <p className="text-gray-400 leading-relaxed max-w-md mb-8">
                The intelligent command center for modern organizations. We eliminate administrative friction so you can focus on building exceptional teams.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-gold hover:text-brand-navy transition-colors cursor-pointer">In</div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-gold hover:text-brand-navy transition-colors cursor-pointer">X</div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-2 md:col-start-7">
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/features" className="hover:text-accent-gold transition-colors">Core Features</Link></li>
                <li><Link to="/how-it-works" className="hover:text-accent-gold transition-colors">How it Works</Link></li>
                <li><Link to="/pricing" className="hover:text-accent-gold transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-accent-gold transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-accent-gold transition-colors">Help Center</a></li>
                <li><Link to="/how-to-use" className="hover:text-accent-gold transition-colors">User Guides</Link></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">System Status</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/why-us" className="hover:text-accent-gold transition-colors">Why HRCore</Link></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-accent-gold transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm pt-8 border-t border-white/10">
            <p>&copy; {new Date().getFullYear()} HRCore. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
