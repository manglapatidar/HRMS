import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Building, Briefcase, MapPin, Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const TAB_CONFIG = [
  { key: 'departments', label: 'Departments', icon: Building },
  { key: 'designations', label: 'Designations', icon: Briefcase },
  { key: 'locations', label: 'Locations', icon: MapPin },
];

const initialFormState = {
  name: '',
  description: '',
  departmentId: '',
  address: '',
  city: '',
  state: '',
  country: '',
};

const OrgSetup = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOrgSetupData = async () => {
    try {
      setLoading(true);
      const [deptRes, desigRes, locRes] = await Promise.all([
        api.get('/org/departments'),
        api.get('/org/designations'),
        api.get('/org/locations'),
      ]);
      setDepartments(deptRes.data || []);
      setDesignations(desigRes.data || []);
      setLocations(locRes.data || []);
    } catch (error) {
      console.error('Failed to load org setup data', error);
      toast.error(error.response?.data?.message || 'Unable to load org setup data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgSetupData();
  }, []);

  useEffect(() => {
    setEditingItem(null);
    setFormData(initialFormState);
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      departmentId: item.departmentId?._id || item.departmentId || '',
      address: item.address || '',
      city: item.city || '',
      state: item.state || '',
      country: item.country || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (activeTab === 'departments') {
        if (!formData.name.trim()) {
          throw new Error('Department name is required');
        }
        if (editingItem) {
          await api.patch(`/org/departments/${editingItem._id}`, {
            name: formData.name,
            description: formData.description,
          });
          toast.success('Department updated successfully');
        } else {
          await api.post('/org/departments', {
            name: formData.name,
            description: formData.description,
          });
          toast.success('Department created successfully');
        }
      }

      if (activeTab === 'designations') {
        if (!formData.name.trim()) {
          throw new Error('Designation name is required');
        }
        if (editingItem) {
          await api.patch(`/org/designations/${editingItem._id}`, {
            name: formData.name,
            departmentId: formData.departmentId || undefined,
          });
          toast.success('Designation updated successfully');
        } else {
          await api.post('/org/designations', {
            name: formData.name,
            departmentId: formData.departmentId || undefined,
          });
          toast.success('Designation created successfully');
        }
      }

      if (activeTab === 'locations') {
        if (!formData.name.trim()) {
          throw new Error('Location name is required');
        }
        const payload = {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        };
        if (editingItem) {
          await api.patch(`/org/locations/${editingItem._id}`, payload);
          toast.success('Location updated successfully');
        } else {
          await api.post('/org/locations', payload);
          toast.success('Location created successfully');
        }
      }

      await fetchOrgSetupData();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmation = window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`);
    if (!confirmation) return;

    try {
      if (activeTab === 'departments') {
        await api.delete(`/org/departments/${item._id}`);
        toast.success('Department deleted successfully');
      }
      if (activeTab === 'designations') {
        await api.delete(`/org/designations/${item._id}`);
        toast.success('Designation deleted successfully');
      }
      if (activeTab === 'locations') {
        await api.delete(`/org/locations/${item._id}`);
        toast.success('Location deleted successfully');
      }
      await fetchOrgSetupData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Unable to delete item');
    }
  };

  const activeItems = activeTab === 'departments'
    ? departments
    : activeTab === 'designations'
      ? designations
      : locations;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-text-dark dark:text-text-light">Org Setup</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Configure departments, designations, and locations for your tenant's organizational structure. HR Admins can create, edit, and remove values while preserving employee assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === tab.key ? 'bg-accent-gold text-brand-navy shadow-sm' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 border-b border-border-light dark:border-border-dark">
          <div>
            <h2 className="text-xl font-semibold text-text-dark dark:text-text-light capitalize">{activeTab}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {activeTab === 'departments' && 'Maintain business units and team groups.'}
              {activeTab === 'designations' && 'Maintain role titles and connect them to departments.'}
              {activeTab === 'locations' && 'Maintain office and remote locations for employees.'}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-accent-gold hover:bg-accent-bronze text-brand-navy px-4 py-2 rounded-md font-semibold shadow-sm transition"
          >
            <Plus size={16} />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>

        <div className="p-5">
          <div className="grid gap-4 mb-6 md:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border-light dark:border-border-dark">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total {activeTab}</p>
              <p className="mt-3 text-3xl font-semibold text-text-dark dark:text-text-light">{activeItems.length}</p>
            </div>
            {activeTab === 'departments' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border-light dark:border-border-dark">
                <p className="text-sm text-gray-500 dark:text-gray-400">Assignments</p>
                <p className="mt-3 text-3xl font-semibold text-text-dark dark:text-text-light">{departments.reduce((sum, item) => sum + (item.employeeCount || 0), 0)}</p>
              </div>
            )}
            {activeTab === 'designations' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border-light dark:border-border-dark">
                <p className="text-sm text-gray-500 dark:text-gray-400">Linked Departments</p>
                <p className="mt-3 text-3xl font-semibold text-text-dark dark:text-text-light">{designations.filter(desig => desig.departmentId).length}</p>
              </div>
            )}
            {activeTab === 'locations' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-border-light dark:border-border-dark">
                <p className="text-sm text-gray-500 dark:text-gray-400">Locations with staff</p>
                <p className="mt-3 text-3xl font-semibold text-text-dark dark:text-text-light">{locations.filter(loc => loc.employeeCount > 0).length}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
              <thead>
                <tr className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Assigned Employees</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</td>
                  </tr>
                ) : activeItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No records found.</td>
                  </tr>
                ) : (
                  activeItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-text-dark dark:text-text-light">{item.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {activeTab === 'departments' && (item.description ? item.description : '-')}
                        {activeTab === 'designations' && (item.departmentId?.name ? item.departmentId.name : 'Unassigned')}
                        {activeTab === 'locations' && (
                          <div className="space-y-1">
                            <p>{item.address || 'No address provided'}</p>
                            <p>{[item.city, item.state, item.country].filter(Boolean).join(', ')}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {item.employeeCount ?? 0}
                        {(item.employeeCount || 0) > 0 && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">Cannot delete while assigned employees exist.</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300 space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-2 text-accent-gold hover:text-accent-bronze"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={(item.employeeCount || 0) > 0}
                          title={(item.employeeCount || 0) > 0 ? 'Reassign employees before deleting.' : 'Delete item'}
                          className={`inline-flex items-center gap-2 ${((item.employeeCount || 0) > 0) ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center justify-between p-5 border-b border-border-light dark:border-border-dark">
                <div>
                  <h3 className="text-xl font-semibold text-text-dark dark:text-text-light">
                    {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add ${activeTab.slice(0, -1)}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeTab === 'departments' && 'Departments help classify your teams and business units.'}
                    {activeTab === 'designations' && 'Designations are role titles tied to departments.'}
                    {activeTab === 'locations' && 'Locations provide address and regional grouping for employees.'}
                  </p>
                </div>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                    placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                    required
                  />
                </div>

                {activeTab === 'departments' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                      rows={4}
                      placeholder="Optional description"
                    />
                  </div>
                )}

                {activeTab === 'designations' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                    >
                      <option value="">No department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'locations' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                      <input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                        placeholder="Street address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                      <input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State / Region</label>
                      <input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                        placeholder="State or region"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                      <input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 text-text-dark dark:text-text-light focus:border-accent-gold focus:ring-accent-gold"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl border border-border-light dark:border-border-dark text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent-gold text-brand-navy font-semibold hover:bg-accent-bronze transition disabled:opacity-70"
                  >
                    {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : `Create ${activeTab.slice(0, -1)}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrgSetup;
