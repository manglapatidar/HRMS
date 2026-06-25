import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Network, User } from 'lucide-react';
import { motion } from 'framer-motion';

const OrgChartNode = ({ employee, employees, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const directReports = employees.filter(emp => emp.reportingManagerId === employee._id);

  return (
    <div className="flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
          level === 0 ? 'border-accent-gold shadow-md' : 'border-border-light dark:border-border-dark'
        } min-w-[200px] cursor-pointer transition-colors hover:border-accent-gold`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {employee.profilePhoto ? (
          <img src={`${import.meta.env.VITE_API_URL || ''}${employee.profilePhoto}`} alt={employee.firstName} className="w-12 h-12 rounded-full mb-2 object-cover border-2 border-accent-gold/20" />
        ) : (
          <div className="w-12 h-12 rounded-full mb-2 bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold text-lg border-2 border-transparent">
            {(employee.firstName && employee.firstName[0]) || ''}{(employee.lastName && employee.lastName[0]) || ''}
          </div>
        )}
        <h3 className="font-medium text-text-dark dark:text-text-light text-center">
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {employee.designationId?.name || 'Employee'}
        </p>
        
        {directReports.length > 0 && (
          <div className="absolute -bottom-3 bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {directReports.length} {isExpanded ? '-' : '+'}
          </div>
        )}
      </motion.div>

      {isExpanded && directReports.length > 0 && (
        <div className="relative pt-6 w-full">
          {/* Vertical line from parent */}
          <div className="absolute top-0 left-1/2 w-px h-6 bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>
          
          {/* Horizontal connector line if multiple children */}
          {directReports.length > 1 && (
            <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" 
                 style={{ 
                   left: `calc(100% / ${directReports.length * 2})`, 
                   right: `calc(100% / ${directReports.length * 2})` 
                 }}>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-start w-full">
            {directReports.map(report => (
              <div key={report._id} className="relative pt-4 w-full md:w-auto">
                {/* Vertical line to child */}
                <div className="absolute top-0 left-1/2 w-px h-4 bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>
                <OrgChartNode employee={report} employees={employees} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrgChart = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    try {
      const res = await api.get('/org/chart');
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to fetch org chart', error);
    } finally {
      setLoading(false);
    }
  };

  // Find root nodes (employees without a reporting manager, or whose manager is not in the list)
  const rootNodes = employees.filter(emp => {
    if (!emp.reportingManagerId) return true;
    return !employees.some(e => e._id === emp.reportingManagerId);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Network size={24} className="text-accent-gold" />
            Organization Chart
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visual hierarchy of all active employees.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-inner border border-border-light dark:border-border-dark p-8 overflow-auto min-h-[600px] flex justify-center">
        {loading ? (
          <div className="text-gray-500">Loading chart...</div>
        ) : employees.length === 0 ? (
          <div className="text-gray-500">No employees found.</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-12 items-start w-full">
            {rootNodes.map(root => (
              <OrgChartNode key={root._id} employee={root} employees={employees} level={0} />
            ))}
            {rootNodes.length === 0 && <div className="text-gray-500">Circular dependency or missing root node detected.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChart;
