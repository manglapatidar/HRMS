import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';

const HowToUse = () => {
  const [activeTab, setActiveTab] = useState('Employee');

  const tabs = ['Employee', 'Manager', 'HR Admin'];

  const content = {
    'Employee': {
      title: 'For Employees: Your Daily Workspace',
      description: 'Navigate your workday with ease using the self-service portal.',
      steps: [
        { title: 'Punching In & Out', detail: 'Simply log in to your dashboard and click the Quick Punch button. Your attendance is instantly recorded.' },
        { title: 'Applying for Leaves', detail: 'Navigate to the Leave section, select your dates, specify the reason, and submit. Your manager is notified instantly.' },
        { title: 'Profile Updates', detail: 'Keep your emergency contacts and address updated without needing to email HR. Changes to sensitive fields will trigger an approval request.' }
      ]
    },
    'Manager': {
      title: 'For Managers: Leading Your Team',
      description: 'Streamline team oversight and unblock your direct reports quickly.',
      steps: [
        { title: 'Reviewing Approvals', detail: 'Your dashboard highlights pending requests. Approve or reject leave applications with a single click, and add optional comments.' },
        { title: 'Team Attendance', detail: 'Check who is present, late, or on leave today at a glance from your Team Dashboard.' },
        { title: 'Performance & Reports', detail: 'Access automated insights about your team\'s attendance trends and leave patterns to better manage resources.' }
      ]
    },
    'HR Admin': {
      title: 'For HR Admins: Organizational Control',
      description: 'Configure and maintain the entire HR ecosystem securely.',
      steps: [
        { title: 'Org Setup', detail: 'Create and structure departments, designations, and geographical locations tailored to your company hierarchy.' },
        { title: 'Onboarding', detail: 'Add new employees individually or import them in bulk. Assign their reporting managers and initial leave balances.' },
        { title: 'Policy Configuration', detail: 'Define custom leave types (e.g., Casual, Sick, Maternity) and set automated annual allowances.' }
      ]
    }
  };

  return (
    <AnimatedPage>
      <div className="py-20 bg-background-light dark:bg-background-dark min-h-[calc(100vh-64px)]">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-text-dark dark:text-text-light mb-4">Getting Started Guide</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Select your role to see how to use HRCore effectively.</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab ? 'text-brand-navy dark:text-brand-navy' : 'text-gray-600 dark:text-gray-400 hover:text-text-dark dark:hover:text-text-light'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent-gold rounded-md shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-border-light dark:border-border-dark p-8 md:p-12 overflow-hidden relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-serif font-bold text-text-dark dark:text-text-light mb-2">
                  {content[activeTab].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 border-b border-border-light dark:border-border-dark pb-6">
                  {content[activeTab].description}
                </p>

                <div className="space-y-8">
                  {content[activeTab].steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-navy/10 dark:bg-accent-gold/20 flex items-center justify-center text-brand-navy dark:text-accent-gold font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-1">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default HowToUse;
