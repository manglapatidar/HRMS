import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AnimatedPage from '../../components/ui/AnimatedPage';
import { Building, Users, MousePointerClick, BarChart3 } from 'lucide-react';

const Step = ({ number, title, description, icon: Icon, align = 'left' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`flex items-center w-full my-12 ${align === 'left' ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`w-full md:w-5/12 flex flex-col ${align === 'left' ? 'items-end text-right pr-8' : 'items-start text-left pl-8'}`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-border-light dark:border-border-dark relative w-full group hover:border-accent-gold transition-colors">
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent-gold text-brand-navy font-bold flex items-center justify-center shadow-sm">
            {number}
          </div>
          <div className="mb-4 text-brand-navy dark:text-accent-gold">
            <Icon size={32} />
          </div>
          <h3 className="text-xl font-serif font-bold text-text-dark dark:text-text-light mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const HowItWorks = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <AnimatedPage>
      <div className="py-20 bg-background-light dark:bg-background-dark">
        <div className="text-center max-w-2xl mx-auto px-6 mb-20">
          <h1 className="text-4xl font-serif font-bold text-text-dark dark:text-text-light mb-4">How HRCore Works</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">From setup to daily operations, see how HRCore streamlines your workflow in four simple steps.</p>
        </div>

        <div className="container mx-auto px-6 relative" ref={containerRef}>
          {/* Animated Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border-light dark:bg-border-dark transform -translate-x-1/2 hidden md:block">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-accent-gold"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="relative z-10 flex flex-col">
            <Step 
              number="1"
              title="Company Setup"
              description="Sign up and instantly get your secure, isolated tenant space. Configure your organizational structure including departments, designations, and locations."
              icon={Building}
              align="left"
            />
            <Step 
              number="2"
              title="Onboard Workforce"
              description="HR admins invite employees, set up reporting managers, and configure custom leave policies and holiday calendars."
              icon={Users}
              align="right"
            />
            <Step 
              number="3"
              title="Daily Self-Service"
              description="Employees log in to their personalized dashboard to punch attendance, apply for leaves, and manage their profiles effortlessly."
              icon={MousePointerClick}
              align="left"
            />
            <Step 
              number="4"
              title="Approve & Analyze"
              description="Managers handle team requests with one-click approvals, while leadership gets real-time insights through dynamic reports and charts."
              icon={BarChart3}
              align="right"
            />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default HowItWorks;
