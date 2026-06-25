import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Filter, Plus, X, CheckCircle, Copy, SlidersHorizontal, Download, Upload, UserMinus, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fileInputRef = React.useRef(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    departmentId: '',
    designationId: '',
    showExited: false
  });
  
  const [orgStructure, setOrgStructure] = useState({ departments: [], designations: [], locations: [] });
  const [potentialManagers, setPotentialManagers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [addError, setAddError] = useState('');
  
  // Adjust Balance Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedEmployeeForAdjust, setSelectedEmployeeForAdjust] = useState(null);
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [adjustFormData, setAdjustFormData] = useState({ leaveTypeId: '', adjustment: 0, reason: '' });
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  // Exit Modal State
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [selectedEmployeeForExit, setSelectedEmployeeForExit] = useState(null);
  const [exitDate, setExitDate] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: 'Employee',
    reportingManagerId: '',
    departmentId: '',
    designationId: '',
    locationId: '',
    shiftId: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
  });

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.departmentId) params.append('departmentId', filters.departmentId);
      if (filters.designationId) params.append('designationId', filters.designationId);
      if (filters.showExited) params.append('status', 'Exited');
      // by default, backend excludes 'Exited' if status is not provided
      
      const res = await api.get(`/org/employees?${params.toString()}`);
      setEmployees(res.data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchLeavePolicies();
    fetchOrgData();
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch shifts', error);
    }
  };

  const fetchOrgData = async () => {
    try {
      const [structRes, mgrsRes] = await Promise.all([
        api.get('/org/structure'),
        api.get('/org/managers')
      ]);
      setOrgStructure(structRes.data);
      setPotentialManagers(mgrsRes.data);
    } catch (error) {
      console.error('Failed to fetch org structure or managers', error);
    }
  };

  const fetchLeavePolicies = async () => {
    try {
      const res = await api.get('/leaves/policies');
      setLeavePolicies(res.data);
    } catch (error) {
      console.error('Failed to fetch leave policies', error);
    }
  };

  const openAdjustModal = (emp) => {
    setSelectedEmployeeForAdjust(emp);
    setAdjustFormData({ leaveTypeId: leavePolicies[0]?._id || '', adjustment: 0, reason: '' });
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setIsAdjusting(true);
    try {
      await api.post('/leaves/admin/adjust-balance', {
        employeeId: selectedEmployeeForAdjust._id,
        leaveTypeId: adjustFormData.leaveTypeId,
        adjustment: Number(adjustFormData.adjustment),
        reason: adjustFormData.reason
      });
      toast.success('Balance adjusted successfully!');
      setIsAdjustModalOpen(false);
    } catch (error) {
      console.error('Failed to adjust balance', error);
      toast.error(error.response?.data?.message || 'Failed to adjust balance');
    } finally {
      setIsAdjusting(false);
    }
  };

  const openExitModal = (emp) => {
    setSelectedEmployeeForExit(emp);
    setExitDate(new Date().toISOString().split('T')[0]);
    setIsExitModalOpen(true);
  };

  const handleExitSubmit = async (e) => {
    e.preventDefault();
    setIsExiting(true);
    try {
      await api.patch(`/org/employees/${selectedEmployeeForExit._id}/exit`, { exitDate });
      toast.success('Employee marked as exited successfully!');
      setIsExitModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Failed to initiate exit', error);
      toast.error(error.response?.data?.message || 'Failed to initiate exit');
    } finally {
      setIsExiting(false);
    }
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.userId?.email || '',
      phone: emp.contactNumber || '',
      employeeId: emp.employeeId,
      role: emp.userId?.role || 'Employee',
      reportingManagerId: emp.reportingManagerId?._id || emp.reportingManagerId || '',
      departmentId: emp.departmentId?._id || emp.departmentId || '',
      designationId: emp.designationId?._id || emp.designationId || '',
      locationId: emp.locationId?._id || emp.locationId || '',
      shiftId: emp.shiftId?._id || emp.shiftId || '',
      dateOfJoining: emp.dateOfJoining ? new Date(emp.dateOfJoining).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setAddError('');
    setNewCredentials(null);
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError('');
    try {
      if (editingEmployee) {
        await api.put(`/org/employees/${editingEmployee._id}`, formData);
        toast.success('Employee profile updated successfully!');
        setIsAddModalOpen(false);
        setEditingEmployee(null);
        fetchEmployees();
      } else {
        const res = await api.post('/org/employees', formData);
        setNewCredentials(res.data.credentials);
        fetchEmployees();
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to submit employee details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsAddModalOpen(false);
    setNewCredentials(null);
    setAddError('');
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      role: 'Employee',
      reportingManagerId: '',
      shiftId: '',
    });
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const csvData = employees.map(emp => ({
      'Employee ID': emp.employeeId,
      'First Name': emp.firstName,
      'Last Name': emp.lastName,
      'Email': emp.userId?.email || '',
      'Role': emp.userId?.role || 'Employee',
      'Department': emp.departmentId?.name || '',
      'Designation': emp.designationId?.name || '',
      'Location': emp.locationId?.name || '',
      'Status': emp.status
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const payload = results.data.map(row => ({
            firstName: row.firstName || row['First Name'],
            lastName: row.lastName || row['Last Name'],
            email: row.email || row['Email'],
            role: row.role || row['Role'] || 'Employee',
            employeeId: row.employeeId || row['Employee ID'],
          }));

          const res = await api.post('/org/employees/bulk', { employees: payload });
          toast.success(res.data.message);
          fetchEmployees();
        } catch (error) {
          console.error('Import failed', error);
          toast.error(error.response?.data?.message || 'Import failed. Check console for details.');
        } finally {
          setIsImporting(false);
          e.target.value = null; // Reset input
        }
      },
      error: (error) => {
        toast.error('Failed to parse CSV: ' + error.message);
        setIsImporting(false);
      }
    });
  };

  // Removed client-side filter and managers filter since we do it server-side

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Users size={24} className="text-accent-gold" />
            Employee Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and view your organization's workforce.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
          />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current.click()} disabled={isImporting} className="p-2.5 border border-border-light dark:border-border-dark rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-405 bg-white dark:bg-gray-800" title="Import Employees via CSV">
            <Upload size={18} className={isImporting ? "opacity-50 animate-pulse" : ""} />
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExportCSV} className="p-2.5 border border-border-light dark:border-border-dark rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-405 bg-white dark:bg-gray-800" title="Export Employees as CSV">
            <Download size={18} />
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-accent-gold hover:bg-accent-bronze text-brand-navy hover:text-white px-4 py-2.5 rounded-md transition-all shadow-sm text-sm font-bold whitespace-nowrap">
            <Plus size={16} />
            Add Employee
          </motion.button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-405" />
          </div>
          <input
            type="text"
            placeholder="Search employees by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-sm focus:ring-accent-gold focus:border-accent-gold text-text-dark dark:text-text-light outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={filters.departmentId} 
            onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
            className="pl-3 pr-8 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-800 text-sm text-text-dark dark:text-text-light focus:outline-none"
          >
            <option value="">All Departments</option>
            {orgStructure.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          <select 
            value={filters.designationId} 
            onChange={(e) => setFilters({...filters, designationId: e.target.value})}
            className="pl-3 pr-8 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-800 text-sm text-text-dark dark:text-text-light focus:outline-none"
          >
            <option value="">All Roles</option>
            {orgStructure.designations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-gray-650 dark:text-gray-305 ml-2">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border-light dark:border-border-dark text-sm font-medium text-gray-500 dark:text-gray-400">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">Loading employees...</td>
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
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
                      {emp.userId?.role || 'Employee'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(emp); }}
                          className="text-gray-500 hover:text-accent-gold transition-colors p-1 flex items-center gap-1 text-sm font-medium"
                          title="Edit Employee Profile"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openAdjustModal(emp); }}
                          className="text-gray-500 hover:text-accent-gold transition-colors p-1 flex items-center gap-1 text-sm font-medium ml-2"
                          title="Adjust Leave Balances"
                        >
                          <SlidersHorizontal size={16} />
                          Adjust
                        </button>
                        {emp.status !== 'Exited' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openExitModal(emp); }}
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 flex items-center gap-1 text-sm font-medium ml-2"
                            title="Initiate Exit"
                          >
                            <UserMinus size={16} />
                            Exit
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  {editingEmployee ? 'Edit Employee Details' : newCredentials ? 'Employee Created Successfully' : 'Add New Employee'}
                </h3>
                <button onClick={resetModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {newCredentials ? (
                  <div className="text-center py-6 space-y-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-text-dark dark:text-text-light mb-2">Account Created!</h4>
                      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Please explicitly share these temporary credentials with the employee. They will be required to change their password on first login.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-lg p-4 max-w-sm mx-auto text-left space-y-3">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email</span>
                        <div className="font-mono text-sm text-text-dark dark:text-text-light mt-1 flex justify-between items-center">
                          {newCredentials.email}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Temporary Password</span>
                        <div className="font-mono text-sm text-text-dark dark:text-text-light mt-1 flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {newCredentials.temporaryPassword}
                          <button 
                            onClick={() => navigator.clipboard.writeText(newCredentials.temporaryPassword)}
                            className="text-gray-400 hover:text-accent-gold transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={resetModal}
                      className="bg-brand-navy hover:bg-brand-slate text-white px-6 py-2 rounded-md transition-colors shadow-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    {addError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800">
                        {addError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                        <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                        <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Email *</label>
                        <input required disabled={!!editingEmployee} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID *</label>
                        <input required disabled={!!editingEmployee} type="text" name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold disabled:opacity-50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Role *</label>
                        <select required name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="Employee" className="dark:bg-gray-800">Employee</option>
                          <option value="Manager" className="dark:bg-gray-800">Manager</option>
                          <option value="Leadership" className="dark:bg-gray-800">Leadership</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reporting Manager</label>
                        <select name="reportingManagerId" value={formData.reportingManagerId} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="" className="dark:bg-gray-800">-- Select Manager --</option>
                          {potentialManagers.map(mgr => (
                            <option key={mgr._id} value={mgr._id} className="dark:bg-gray-800">
                              {mgr.firstName} {mgr.lastName} ({mgr.employeeId})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                        <select name="departmentId" value={formData.departmentId} onChange={(e) => {
                          const selectedDept = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            departmentId: selectedDept,
                            designationId: selectedDept ? prev.designationId : ''
                          }));
                        }} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="" className="dark:bg-gray-800">-- Select Department --</option>
                          {orgStructure.departments.map(d => (
                            <option key={d._id} value={d._id} className="dark:bg-gray-800">{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                        <select name="designationId" value={formData.designationId} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="" className="dark:bg-gray-800">-- Select Designation --</option>
                          {orgStructure.designations
                            .filter(desig => !formData.departmentId || desig.departmentId?._id === formData.departmentId)
                            .map(d => (
                              <option key={d._id} value={d._id} className="dark:bg-gray-800">{d.name}</option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <select name="locationId" value={formData.locationId} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="" className="dark:bg-gray-800">-- Select Location --</option>
                          {orgStructure.locations.map(l => (
                            <option key={l._id} value={l._id} className="dark:bg-gray-800">{l.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift Schedule</label>
                        <select name="shiftId" value={formData.shiftId} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                          <option value="" className="dark:bg-gray-800">-- Default Shift --</option>
                          {shifts.map(s => (
                            <option key={s._id} value={s._id} className="dark:bg-gray-800">
                              {s.name} ({s.startTime} - {s.endTime})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Joining</label>
                        <input type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                      </div>
                      <div />
                    </div>

                    <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={resetModal} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} type="submit" className="bg-accent-gold hover:bg-accent-bronze text-brand-navy hover:text-white px-4 py-2 rounded-md transition-colors shadow-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                        {isSubmitting ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Employee'}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Adjust Balance Modal */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedEmployeeForAdjust && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light">
                  Adjust Leave Balance
                </h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Adjusting balance for <span className="font-semibold text-text-dark dark:text-text-light">{selectedEmployeeForAdjust.firstName} {selectedEmployeeForAdjust.lastName}</span>. Positive numbers add days, negative numbers subtract days.
                </p>
                <form onSubmit={handleAdjustSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                    <select required value={adjustFormData.leaveTypeId} onChange={(e) => setAdjustFormData({...adjustFormData, leaveTypeId: e.target.value})} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold">
                      {leavePolicies.filter(p => p.requiresBalance).map(pol => (
                        <option key={pol._id} value={pol._id} className="dark:bg-gray-800">{pol.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adjustment (Days)</label>
                    <input required type="number" step="0.5" value={adjustFormData.adjustment} onChange={(e) => setAdjustFormData({...adjustFormData, adjustment: e.target.value})} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" placeholder="e.g. 2 or -1.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason (Audit Log)</label>
                    <input required type="text" value={adjustFormData.reason} onChange={(e) => setAdjustFormData({...adjustFormData, reason: e.target.value})} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" placeholder="e.g. Granted extra comp off" />
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">Cancel</button>
                    <button disabled={isAdjusting} type="submit" className="bg-brand-navy hover:bg-brand-slate text-white px-4 py-2 rounded-md transition-colors shadow-sm font-medium disabled:opacity-70">
                      {isAdjusting ? 'Applying...' : 'Apply Adjustment'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Modal */}
      <AnimatePresence>
        {isExitModalOpen && selectedEmployeeForExit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light text-red-600 dark:text-red-400">
                  Initiate Employee Exit
                </h3>
                <button onClick={() => setIsExitModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  You are about to offboard <span className="font-semibold text-text-dark dark:text-text-light">{selectedEmployeeForExit.firstName} {selectedEmployeeForExit.lastName}</span>. This will mark their status as "Exited".
                </p>
                <form onSubmit={handleExitSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exit Date *</label>
                    <input required type="date" value={exitDate} onChange={(e) => setExitDate(e.target.value)} className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-transparent text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold" />
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsExitModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium">Cancel</button>
                    <button disabled={isExiting} type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors shadow-sm font-medium disabled:opacity-70">
                      {isExiting ? 'Processing...' : 'Confirm Exit'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Employees;
