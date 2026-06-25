import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { Check, X } from 'lucide-react';

const WhyUs = () => {
  const comparisons = [
    {
      feature: 'Data Security & Privacy',
      manual: 'Files saved on local drives, emailed around, prone to leaks.',
      nova: 'Enterprise-grade multi-tenant architecture with encrypted JWT sessions.',
    },
    {
      feature: 'Leave Tracking',
      manual: 'Manual entry in spreadsheets, frequent miscalculations.',
      nova: 'Automated accruals, balance checking, and instant manager approvals.',
    },
    {
      feature: 'Attendance',
      manual: 'Physical punch cards or trust-based emails.',
      nova: 'Web-based secure punching tied to specific shift timings.',
    },
    {
      feature: 'Accessibility',
      manual: 'Requires HR intervention for every small profile update.',
      nova: '24/7 Self-Service portal for all employees.',
    }
  ];

  return (
    <AnimatedPage>
      <div className="py-20 bg-background-light dark:bg-background-dark pb-32">
        <div className="container mx-auto px-6 max-w-5xl">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-text-dark dark:text-text-light mb-4">Why Choose HRCore?</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Leave the spreadsheets behind. Modernize your workflow.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden mb-24"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Manual Side */}
              <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-gray-900/50">
                <h3 className="text-2xl font-serif font-bold text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-3">
                  <X className="text-status-error" /> Manual Tracking
                </h3>
                <div className="space-y-8">
                  {comparisons.map((item, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.feature}</p>
                      <p className="text-gray-600 dark:text-gray-400">{item.manual}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* HRCore Side */}
              <div className="p-8 md:p-12 bg-brand-navy dark:bg-brand-slate text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl"></div>
                <h3 className="text-2xl font-serif font-bold text-accent-gold mb-8 flex items-center gap-3 relative z-10">
                  <Check className="text-status-success" /> HRCore Automation
                </h3>
                <div className="space-y-8 relative z-10">
                  {comparisons.map((item, idx) => (
                    <div key={idx}>
                      <p className="text-sm font-semibold text-accent-bronze uppercase tracking-wide mb-1">{item.feature}</p>
                      <p className="text-gray-200">{item.nova}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-brand-navy dark:bg-brand-slate py-16 px-8 text-center border border-accent-gold/20 shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-gold/20 via-transparent to-transparent opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Ready to modernize your HR?</h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of companies that trust HRCore to manage their most valuable asset—their people.</p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent-gold hover:bg-accent-bronze text-brand-navy font-semibold px-8 py-3 rounded-md shadow-md transition-colors text-lg"
                >
                  Get Started Now
                </motion.button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default WhyUs;
