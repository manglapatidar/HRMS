import React from 'react';
import { motion } from 'framer-motion';

const ring = {
  animate: {
    rotate: 360,
    transition: { repeat: Infinity, duration: 1.6, ease: 'linear' }
  }
};

const pulse = {
  animate: {
    scale: [1, 1.06, 1],
    opacity: [1, 0.9, 1],
    transition: { repeat: Infinity, duration: 1.8 }
  }
};

export const Spinner = ({ size = 16 }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#D1A054" strokeWidth="3" strokeOpacity="0.2" />
    <path d="M22 12a10 10 0 00-10-10" stroke="#D1A054" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Loader = ({ variant = 'full' }) => {
  if (variant === 'button') {
    return (
      <span className="inline-flex items-center justify-center">
        <Spinner size={14} />
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3">
        <motion.div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center" variants={pulse} animate="animate">
          <motion.div className="text-accent-gold font-bold" variants={pulse} animate="animate">H</motion.div>
        </motion.div>
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-brand-navy/80 to-[#071026]/80">
      <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div variants={ring} animate="animate" className="relative">
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#D1A054" strokeWidth="1.8" strokeOpacity="0.15" />
            <path d="M22 12a10 10 0 00-10-10" stroke="#D1A054" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <motion.div className="absolute inset-0 flex items-center justify-center text-accent-gold font-bold text-2xl">H</motion.div>
        </motion.div>
        <motion.div initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-gray-200">Loading…</motion.div>
      </motion.div>
    </div>
  );
};

export default Loader;
