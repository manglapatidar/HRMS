import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Search, ChevronLeft, ChevronRight, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AttendanceRegister = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [gridData, setGridData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [loading, setLoading] = useState(true);
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tooltip/Detail modal state
  const [activeCell, setActiveCell] = useState(null);

  const fetchRegister = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/register?year=${year}&month=${month}`);
      setGridData(res.data.grid || []);
      setDaysInMonth(res.data.daysInMonth || 30);
    } catch (err) {
      console.error('Failed to fetch attendance register', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const filteredGridData = gridData.filter(row => {
    const fullName = `${row.firstName} ${row.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || row.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCodeColorClass = (code) => {
    switch (code) {
      case 'P':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'L':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'HD':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800';
      case 'A':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'LV':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'H':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'WE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-50 text-gray-400 dark:bg-gray-850 dark:text-gray-600 border border-transparent';
    }
  };

  const getDayName = (dayNum) => {
    const d = new Date(year, month - 1, dayNum);
    return d.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Calendar size={24} className="text-accent-gold" />
            Attendance Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monthly grid view of all employee attendance status and timestamps.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-border-light dark:border-border-dark p-1.5 rounded-lg shadow-sm">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 text-gray-500 hover:text-accent-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-2 py-1 font-semibold text-text-dark dark:text-text-light bg-transparent focus:outline-none border-none cursor-pointer"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx + 1} className="dark:bg-gray-800">{m}</option>
            ))}
          </select>
          
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-2 py-1 font-semibold text-text-dark dark:text-text-light bg-transparent focus:outline-none border-none cursor-pointer"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y} className="dark:bg-gray-800">{y}</option>
            ))}
          </select>
          
          <button 
            onClick={handleNextMonth}
            className="p-1.5 text-gray-500 hover:text-accent-gold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-wrap justify-between items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search employee by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-green-100 text-green-800 border border-green-200">P</span>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-200">L</span>
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-orange-100 text-orange-800 border border-orange-200">HD</span>
            <span>Half-Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-red-100 text-red-800 border border-red-200">A</span>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-blue-100 text-blue-800 border border-blue-200">LV</span>
            <span>Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-purple-100 text-purple-800 border border-purple-200">H</span>
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 flex items-center justify-center rounded text-[10px] bg-gray-100 text-gray-800 border border-gray-200">WE</span>
            <span>Weekend</span>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/90 backdrop-blur-sm border-b border-border-light dark:border-border-dark z-20">
              <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 sticky left-0 bg-gray-50 dark:bg-gray-900/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-30 min-w-[200px]">Employee</th>
                {Array.from({ length: daysInMonth }).map((_, idx) => (
                  <th key={idx} className="px-1.5 py-3 text-center border-l border-border-light dark:border-border-dark min-w-[34px]">
                    <div className="font-mono text-gray-400 dark:text-gray-600 uppercase tracking-tight text-[9px]">
                      {getDayName(idx + 1)}
                    </div>
                    <div className="mt-0.5 text-xs">
                      {idx + 1}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark text-sm">
              {loading ? (
                <tr>
                  <td colSpan={daysInMonth + 1} className="px-6 py-12 text-center text-gray-500">Loading monthly records...</td>
                </tr>
              ) : filteredGridData.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 1} className="px-6 py-12 text-center text-gray-500">No employees found.</td>
                </tr>
              ) : (
                filteredGridData.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    {/* Fixed Employee Details Column */}
                    <td className="px-4 py-3 sticky left-0 bg-white dark:bg-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                      <div className="font-medium text-text-dark dark:text-text-light truncate max-w-[190px]">
                        {row.firstName} {row.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">
                        {row.employeeId} • {row.department}
                      </div>
                    </td>
                    
                    {/* Day Grid Cells */}
                    {row.days.map((dayObj) => (
                      <td 
                        key={dayObj.day} 
                        onClick={() => dayObj.code !== '-' && setActiveCell({
                          employeeName: `${row.firstName} ${row.lastName}`,
                          date: new Date(year, month - 1, dayObj.day).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }),
                          ...dayObj
                        })}
                        className="px-0.5 py-2 text-center border-l border-border-light dark:border-border-dark"
                      >
                        <button 
                          className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition-transform hover:scale-110 flex items-center justify-center mx-auto ${getCodeColorClass(dayObj.code)}`}
                        >
                          {dayObj.code}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Detail Modal */}
      <AnimatePresence>
        {activeCell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-border-light dark:border-border-dark overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h4 className="font-bold text-text-dark dark:text-text-light">
                  Attendance Info
                </h4>
                <button 
                  onClick={() => setActiveCell(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Employee</p>
                  <p className="text-base font-semibold text-text-dark dark:text-text-light">{activeCell.employeeName}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Date</p>
                  <p className="text-sm font-medium text-text-dark dark:text-text-light">{activeCell.date}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Punch In</p>
                    <p className="text-sm font-mono font-medium text-text-dark dark:text-text-light">
                      {activeCell.punchInTime ? new Date(activeCell.punchInTime).toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Punch Out</p>
                    <p className="text-sm font-mono font-medium text-text-dark dark:text-text-light">
                      {activeCell.punchOutTime ? new Date(activeCell.punchOutTime).toLocaleTimeString() : '--:--'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status / Code</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getCodeColorClass(activeCell.code)}`}>
                      {activeCell.code}
                    </span>
                    <span className="text-sm font-medium text-text-dark dark:text-text-light">{activeCell.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceRegister;
