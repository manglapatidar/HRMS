import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend
} from 'recharts';
import api from '../api/axios';
import { motion } from 'framer-motion';

const COLORS = ['#D4AF37', '#1E2A38', '#4B5E72', '#A3B1C6', '#2C3E50', '#85929E'];

const TeamReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/team-reports');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch team reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-gray-500">Loading team reports...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-gray-500">Failed to load team reports.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <BarChart3 className="text-accent-gold" /> Team Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time analytics and attendance trends for your direct reports.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Size</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.teamSize}</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4"
        >
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Present Today</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.presentToday}</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4"
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On Leave Today</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.onLeaveToday}</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4"
        >
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
            <CheckSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.pendingApprovals}</h3>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light mb-4">
            Team Attendance Trend (Last 30 Days)
          </h3>
          <div className="h-80">
            {data.attendanceTrend && data.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} unit="%" />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="percent" name="Attendance" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No attendance history records found.</div>
            )}
          </div>
        </div>

        {/* Leave Usage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light mb-4">
            Team Leave Usage by Type (Last 90 Days)
          </h3>
          <div className="h-80">
            {data.leaveUsage && data.leaveUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.leaveUsage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} unit="d" />
                  <RechartsTooltip />
                  <Bar dataKey="days" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                    {data.leaveUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No leave usage records found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
            Individual Team Member Summary (Current Month)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Attendance Rate</th>
                <th className="px-6 py-4">Approved Leaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm text-gray-700 dark:text-gray-300">
              {data.teamSummary && data.teamSummary.length > 0 ? (
                data.teamSummary.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-dark dark:text-text-light">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{emp.employeeId}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{emp.attendancePercent}%</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-accent-gold h-full rounded-full" 
                            style={{ width: `${Math.min(emp.attendancePercent, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {emp.leavesCount} days
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No direct reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamReports;
