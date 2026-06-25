import React, { useState, useEffect } from 'react';
import { PieChart, Users, CheckCircle, Clock, UserMinus } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../api/axios';

const COLORS = ['#D4AF37', '#1E2A38', '#4B5E72', '#A3B1C6', '#2C3E50', '#85929E'];

const WorkforceAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/workforce-analytics');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch workforce analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
        <PieChart className="text-accent-gold" /> Workforce Analytics
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4">
          <div className="p-3 bg-brand-navy/10 dark:bg-brand-navy/20 rounded-lg text-brand-navy dark:text-brand-slate">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Headcount</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.totalHeadcount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Today</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.attendanceTodayPercent}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4">
          <div className="p-3 bg-accent-gold/20 rounded-lg text-accent-bronze dark:text-accent-gold">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.pendingApprovals}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <UserMinus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">90-Day Attrition</p>
            <h3 className="text-2xl font-bold text-text-dark dark:text-text-light">{data.attritionRate}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount by Department */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-6">Headcount by Department</h3>
          <div className="h-[300px]">
            {data.deptHeadcount && data.deptHeadcount.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.deptHeadcount}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.deptHeadcount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} Employees`, 'Headcount']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No department data available</div>
            )}
          </div>
        </div>

        {/* Leave Usage Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-6">Leave Usage (Last 6 Months)</h3>
          <div className="h-[300px]">
             {data.leaveUsageTrend && data.leaveUsageTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.leaveUsageTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Bar dataKey="days" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Days Taken" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex h-full items-center justify-center text-gray-500">No leave data available</div>
            )}
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark lg:col-span-2">
          <h3 className="text-lg font-medium text-text-dark dark:text-text-light mb-6">Attendance Trend (Last 30 Days)</h3>
          <div className="h-[300px]">
            {data.attendanceTrend && data.attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendanceTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                    }}
                    minTickGap={20}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B7280', fontSize: 12}}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    formatter={(value) => [`${value}%`, 'Present']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percent" 
                    stroke="#1E2A38" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No attendance data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceAnalytics;
