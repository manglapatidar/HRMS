import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Filter, X, Building, MapPin, Briefcase, Calendar, Mail, Phone, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrgDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    departmentId: '',
    designationId: '',
    locationId: '',
    showExited: false
  });
  
  const [orgStructure, setOrgStructure] = useState({ departments: [], designations: [], locations: [] });

  // Read-only profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.designationId) params.append('designationId', filters.designationId);
      if (filters.locationId) params.append('locationId', filters.locationId);
      if (filters.showExited) params.append('status', 'Exited,Active,On Probation');

      const res = await api.get(`/org/employees?${params.toString()}`);
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgStructure = async () => {
    try {
      const res = await api.get('/org/structure');
      setOrgStructure(res.data);
    } catch (error) {
      console.error('Failed to fetch org structure', error);
    }
  };

  useEffect(() => {
    fetchOrgStructure();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters]);

  const openProfileModal = (emp) => {
    setSelectedEmployee(emp);
    setIsProfileModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Users className="text-accent-gold" /> Organization Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Browse and search all employees in the organization.</p>
        </div>
      </div>

      {/* Top Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-border-light dark:border-border-dark mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold"
          />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 pr-3 hidden md:flex">
            <Filter size={16} /> <span className="text-sm">Filters</span>
          </div>
          
          <select 
            value={filters.departmentId} 
            onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
            className="hidden md:block pl-3 pr-8 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm text-text-dark dark:text-text-light focus:outline-none"
          >
            <option value="">All Depts</option>
            {orgStructure.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select 
            value={filters.designationId} 
            onChange={(e) => setFilters({...filters, designationId: e.target.value})}
            className="hidden md:block pl-3 pr-8 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm text-text-dark dark:text-text-light focus:outline-none"
          >
            <option value="">All Roles</option>
            {orgStructure.designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select 
            value={filters.locationId} 
            onChange={(e) => setFilters({...filters, locationId: e.target.value})}
            className="hidden md:block pl-3 pr-8 py-2 border border-border-light dark:border-border-dark rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm text-text-dark dark:text-text-light focus:outline-none"
          >
            <option value="">All Locs</option>
            {orgStructure.locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ml-2">
            <input 
              type="checkbox" 
              checked={filters.showExited} 
              onChange={(e) => setFilters({...filters, showExited: e.target.checked})}
              className="rounded border-gray-300 text-accent-gold focus:ring-accent-gold"
            />
            Show Exited
          </label>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900/90 backdrop-blur border-b border-border-light dark:border-border-dark z-10">
              <tr className="text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading directory...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No employees found.</td>
                </tr>
              ) : (
                employees.map((emp, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={emp._id} 
                    onClick={() => openProfileModal(emp)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {emp.profilePhoto ? (
                          <img src={`${import.meta.env.VITE_API_URL || ''}${emp.profilePhoto}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold">
                            {(emp.firstName && emp.firstName[0]) || ''}{(emp.lastName && emp.lastName[0]) || ''}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-text-dark dark:text-text-light group-hover:text-accent-gold transition-colors">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{emp.userId?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                      {emp.employeeId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {emp.departmentId?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {emp.designationId?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                          : emp.status === 'Exited'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Read-Only Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
                  <UserCircle size={20} className="text-accent-gold"/> Employee Profile
                </h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                   {selectedEmployee.profilePhoto ? (
                      <img src={`${import.meta.env.VITE_API_URL || ''}${selectedEmployee.profilePhoto}`} alt="avatar" className="w-24 h-24 rounded-full object-cover border-2 border-accent-gold shadow-md" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold text-3xl shadow-sm border border-accent-gold/30">
                        {(selectedEmployee.firstName && selectedEmployee.firstName[0]) || ''}{(selectedEmployee.lastName && selectedEmployee.lastName[0]) || ''}
                      </div>
                    )}
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold text-text-dark dark:text-text-light">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                      <p className="text-gray-500 dark:text-gray-400 font-mono mt-1">{selectedEmployee.employeeId}</p>
                      <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2">
                         <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          selectedEmployee.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                            : selectedEmployee.status === 'Exited'
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                          {selectedEmployee.status}
                        </span>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                          {selectedEmployee.userId?.role || 'Employee'}
                        </span>
                      </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-border-light dark:border-border-dark pb-2">Organization Details</h4>
                    
                    <div className="flex items-start gap-3">
                      <Building size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Department</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">{selectedEmployee.departmentId?.name || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Designation</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">{selectedEmployee.designationId?.name || '-'}</p>
                      </div>
                    </div>

                     <div className="flex items-start gap-3">
                      <Users size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Reporting Manager</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">
                          {selectedEmployee.reportingManagerId && selectedEmployee.reportingManagerId.firstName 
                            ? `${selectedEmployee.reportingManagerId.firstName} ${selectedEmployee.reportingManagerId.lastName || ''}` 
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-border-light dark:border-border-dark pb-2">Contact & Info</h4>
                    
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">{selectedEmployee.userId?.email || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Contact Number</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">{selectedEmployee.contactNumber || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">{selectedEmployee.locationId?.name || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar size={18} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Date of Joining</p>
                        <p className="text-sm font-medium text-text-dark dark:text-text-light">
                          {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>

                    {selectedEmployee.status === 'Exited' && selectedEmployee.exitDate && (
                       <div className="flex items-start gap-3">
                        <Calendar size={18} className="text-red-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-500">Exit Date</p>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {new Date(selectedEmployee.exitDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
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

export default OrgDirectory;
