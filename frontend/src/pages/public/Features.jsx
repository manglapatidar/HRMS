import React from 'react';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { Users, Clock, Calendar, CheckSquare, ShieldCheck, PieChart, Smartphone, Settings } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-border-light dark:border-border-dark hover:shadow-md transition-all group"
  >
    <div className="w-12 h-12 rounded-lg bg-brand-navy/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-accent-gold/10 transition-colors">
      <Icon size={24} className="text-brand-navy dark:text-accent-gold" />
    </div>
    <h3 className="text-xl font-serif font-bold text-text-dark dark:text-text-light mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
      {description}
    </p>
    <a href="#" className="text-accent-gold font-medium text-sm hover:text-accent-bronze transition-colors flex items-center gap-1">
      Learn more <span>&rarr;</span>
    </a>
  </motion.div>
);

const Features = () => {
  const features = [
    { icon: Users, title: 'Employee Management', description: 'Centralize your employee database with a searchable directory, org charts, and full lifecycle tracking.' },
    { icon: Clock, title: 'Attendance Tracking', description: 'Simple web-based punch in/out with automated shift mapping and detailed attendance registers.' },
    { icon: Calendar, title: 'Leave Management', description: 'Customizable leave policies, automated balance tracking, and straightforward application workflows.' },
    { icon: CheckSquare, title: 'Approval Workflows', description: 'Route requests to the right managers automatically with a unified, one-click approval engine.' },
    { icon: Smartphone, title: 'Self-Service Portal', description: 'Empower employees to update profiles, check balances, and apply for leaves independently.' },
    { icon: PieChart, title: 'Reporting & Dashboards', description: 'Gain actionable insights with real-time charts on headcount, attendance, and leave trends.' },
    { icon: ShieldCheck, title: 'Multi-Tenant Security', description: 'Enterprise-grade data isolation ensuring your company data is strictly separated and secure.' },
    { icon: Settings, title: 'Customizable Policies', description: 'Flexible configuration for departments, designations, shifts, and holiday calendars.' },
  ];

  return (
    <AnimatedPage>
      <div className="pb-20">
        {/* Hero Banner */}
        <div className="bg-brand-navy dark:bg-brand-slate py-20 px-6 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-gold via-transparent to-transparent"></div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4 relative z-10"
          >
            Everything you need to manage your workforce
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto relative z-10"
          >
            Powerful, intuitive tools designed to eliminate manual HR tasks and provide deep organizational insights.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 mt-24"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-text-dark dark:text-text-light mb-4">Role-Based Access</h2>
            <p className="text-gray-600 dark:text-gray-400">Tailored experiences for every level of your organization.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-border-light dark:border-border-dark">
                  <th className="py-4 px-6 font-serif text-lg text-text-dark dark:text-text-light">Capability</th>
                  <th className="py-4 px-6 font-serif text-lg text-center text-text-dark dark:text-text-light">Employee</th>
                  <th className="py-4 px-6 font-serif text-lg text-center text-text-dark dark:text-text-light">Manager</th>
                  <th className="py-4 px-6 font-serif text-lg text-center text-text-dark dark:text-text-light">HR Admin</th>
                  <th className="py-4 px-6 font-serif text-lg text-center text-text-dark dark:text-text-light">Leadership</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300">
                {[
                  ['View Own Profile & Balances', true, true, true, false],
                  ['Punch In/Out', true, true, false, false],
                  ['View Team Attendance', false, true, true, false],
                  ['Approve Leave Requests', false, true, true, false],
                  ['Manage Org Structure', false, false, true, false],
                  ['View Company-wide Analytics', false, false, true, true],
                ].map(([feature, emp, mgr, hr, lead], idx) => (
                  <tr key={idx} className="border-b border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-text-dark dark:text-text-light">{feature}</td>
                    <td className="py-4 px-6 text-center">{emp && <span className="text-status-success text-xl">✓</span>}</td>
                    <td className="py-4 px-6 text-center">{mgr && <span className="text-status-success text-xl">✓</span>}</td>
                    <td className="py-4 px-6 text-center">{hr && <span className="text-status-success text-xl">✓</span>}</td>
                    <td className="py-4 px-6 text-center">{lead && <span className="text-status-success text-xl">✓</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default Features;
