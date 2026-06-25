import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Users, CheckSquare, Clock, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      return res.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePunch = async () => {
    try {
      const res = await api.post('/attendance/punch');
      const punchStatus = res.data.punchStatus || (res.data.record?.punchOutTime ? 'Punched Out' : res.data.record?.punchInTime ? 'Punched In' : 'Not Punched In');
      setStats(prev => ({
        ...prev,
        punchStatus,
        isPresentToday: punchStatus === 'Punched In',
      }));

      const updatedStats = await fetchStats();
      if (updatedStats) {
        setStats({
          ...updatedStats,
          punchStatus,
        });
      }
      toast.success(res.data.message || 'Attendance recorded');
    } catch (error) {
      console.error('Failed to punch:', error);
      const msg = error.response?.data?.message || 'Failed to record attendance';
      toast.error(msg);
      const punchStatus = error.response?.data?.punchStatus || 'Punched Out';
      setStats(prev => ({
        ...prev,
        punchStatus,
        isPresentToday: punchStatus === 'Punched In',
      }));
      await fetchStats();
    }
  };

  if (loading) return <div className="p-8"><Loader variant="inline" /></div>;

  // Use real data from backend, fallback to empty array if not loaded
  const attendanceData = stats?.attendanceTrends && stats.attendanceTrends.length > 0 
    ? stats.attendanceTrends 
    : [
        { name: 'Mon', present: 0, absent: 0 },
        { name: 'Tue', present: 0, absent: 0 },
        { name: 'Wed', present: 0, absent: 0 },
        { name: 'Thu', present: 0, absent: 0 },
        { name: 'Fri', present: 0, absent: 0 },
      ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light">
          Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-md shadow-sm border border-border-light dark:border-border-dark">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {user.role === 'Employee' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <StatCard 
              title="Today's Status" 
              value={stats?.isPresentToday ? 'Present' : 'Not Punched In'} 
              icon={Clock} 
              color={stats?.isPresentToday ? "text-status-success" : "text-gray-400"}
              bg={stats?.isPresentToday ? "bg-status-success/10" : "bg-gray-100 dark:bg-gray-800"}
            />
            <StatCard 
              title="Pending Leaves" 
              value={stats?.pendingLeaves || 0} 
              icon={CheckSquare} 
              color="text-accent-gold"
              bg="bg-accent-gold/10"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
              <h3 className="text-lg font-medium mb-6 text-text-dark dark:text-text-light">My Attendance (This Week)</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="present" fill="#0A2342" radius={[4, 4, 0, 0]} name="Present %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-8 flex flex-col justify-center items-center text-center">
              <h2 className="text-xl font-medium mb-2">{stats?.message || 'Welcome to HRCore'}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Manage your profile, attendance, and leaves from the sidebar.</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePunch}
                disabled={stats?.punchStatus === 'Punched Out'}
                className={`px-6 py-2 rounded-md transition-colors shadow-sm w-full font-medium ${
                  stats?.punchStatus === 'Punched Out'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                    : stats?.punchStatus === 'Punched In'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-brand-navy hover:bg-brand-slate text-white'
                }`}
              >
                {stats?.punchStatus === 'Punched Out' ? 'Done for Today' : stats?.punchStatus === 'Punched In' ? 'Punch Out' : 'Quick Punch In'}
              </motion.button>
            </div>
          </div>
        </>
      )}

      {(user.role === 'HR Admin' || user.role === 'Leadership') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Employees" 
              value={stats?.totalEmployees || 0} 
              icon={Users} 
              color="text-brand-navy"
              bg="bg-brand-navy/10"
            />
            <StatCard 
              title="Present Today" 
              value={stats?.presentToday || 0} 
              icon={Clock} 
              color="text-status-success"
              bg="bg-status-success/10"
            />
            <StatCard 
              title="Pending Approvals" 
              value={stats?.pendingApprovals || 0} 
              icon={CheckSquare} 
              color="text-accent-gold"
              bg="bg-accent-gold/10"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
            <h3 className="text-lg font-medium mb-6 text-text-dark dark:text-text-light">Attendance Trends (This Week)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="present" fill="#0A2342" radius={[4, 4, 0, 0]} name="Present %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Self-service punch for HR Admin / Leadership */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6 mt-6">
            <h3 className="text-lg font-medium mb-4 text-text-dark dark:text-text-light">My Self-Service</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Punch in or out to log your own work hours.</p>
              </div>
              <div className="w-full md:w-64">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePunch} disabled={stats?.punchStatus === 'Punched Out'} className={`px-6 py-2 rounded-md transition-colors shadow-sm w-full font-medium ${stats?.punchStatus === 'Punched Out' ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : stats?.punchStatus === 'Punched In' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-brand-navy hover:bg-brand-slate text-white'}`}>
                  {stats?.punchStatus === 'Punched Out' ? 'Done for Today' : stats?.punchStatus === 'Punched In' ? 'Punch Out' : 'Quick Punch In'}
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}

      {user.role === 'Manager' && (
        <div className="space-y-8">
          {/* Section 1: Manager Personal Attendance / Self-Service */}
          <div>
            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4 border-b pb-2">My Self-Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <StatCard 
                title="My Attendance Today" 
                value={stats?.isPresentToday ? 'Present' : 'Not Punched In'} 
                icon={Clock} 
                color={stats?.isPresentToday ? "text-status-success" : "text-gray-400"}
                bg={stats?.isPresentToday ? "bg-status-success/10" : "bg-gray-100 dark:bg-gray-800"}
              />
              <StatCard 
                title="My Pending Leaves" 
                value={stats?.pendingLeaves || 0} 
                icon={CheckSquare} 
                color="text-accent-gold"
                bg="bg-accent-gold/10"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6">
                <h3 className="text-base font-medium mb-6 text-text-dark dark:text-text-light">My Attendance Trends</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E2E2" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="present" fill="#0A2342" radius={[4, 4, 0, 0]} name="Present %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6 flex flex-col justify-center items-center text-center">
                <h2 className="text-lg font-semibold mb-2">{stats?.message || 'Self-Service Panel'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Punch in or out to log your own work hours.</p>
                <button 
                  onClick={handlePunch}
                  disabled={stats?.punchStatus === 'Punched Out'}
                  className={`px-6 py-2 rounded-md transition-colors shadow-sm w-full font-medium ${
                    stats?.punchStatus === 'Punched Out'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                      : stats?.punchStatus === 'Punched In'
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-brand-navy hover:bg-brand-slate text-white'
                  }`}
                >
                  {stats?.punchStatus === 'Punched Out' ? 'Done for Today' : stats?.punchStatus === 'Punched In' ? 'Punch Out' : 'Quick Punch In'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Manager Team Summary */}
          <div>
            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light mb-4 border-b pb-2">My Team Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Team Size" 
                value={stats?.teamSize || 0} 
                icon={Users} 
                color="text-brand-navy"
                bg="bg-brand-navy/10"
              />
              <StatCard 
                title="Present Today" 
                value={stats?.presentToday || 0} 
                icon={Clock} 
                color="text-status-success"
                bg="bg-status-success/10"
              />
              <StatCard 
                title="On Leave Today" 
                value={stats?.onLeaveToday || 0} 
                icon={Calendar} 
                color="text-blue-600"
                bg="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard 
                title="Pending Approvals" 
                value={stats?.pendingApprovals || 0} 
                icon={CheckSquare} 
                color="text-accent-gold"
                bg="bg-accent-gold/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border-light dark:border-border-dark p-6 flex items-center" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
    <div className={`p-4 rounded-full ${bg} ${color} mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
      <p className="text-3xl font-serif font-bold text-text-dark dark:text-text-light">{value}</p>
    </div>
  </motion.div>
);

export default Dashboard;
