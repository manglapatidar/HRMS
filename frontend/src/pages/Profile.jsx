import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Lock, Loader2, AlertCircle, UserCircle, Users, Building, CheckSquare, BarChart3 } from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [hrStats, setHrStats] = useState({ departments: 0, designations: 0, locations: 0, activeEmployees: 0 });
  const [hrLoading, setHrLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [delegateId, setDelegateId] = useState('');
  const [delegateStart, setDelegateStart] = useState('');
  const [delegateEnd, setDelegateEnd] = useState('');
  const [savingDelegation, setSavingDelegation] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user?.role === 'HR Admin') {
      fetchHrStats();
    }
    if (user?.role === 'Manager' || user?.role === 'HR Admin') {
      fetchManagers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/org/employees/me');
      setProfile(res.data);
      if (res.data.delegationDelegateId) {
        setDelegateId(res.data.delegationDelegateId._id || res.data.delegationDelegateId);
        setDelegateStart(res.data.delegationStartDate ? res.data.delegationStartDate.split('T')[0] : '');
        setDelegateEnd(res.data.delegationEndDate ? res.data.delegationEndDate.split('T')[0] : '');
      } else {
        setDelegateId('');
        setDelegateStart('');
        setDelegateEnd('');
      }
    } catch (error) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const fetchHrStats = async () => {
    try {
      setHrLoading(true);
      const [deptRes, desigRes, locRes, empRes] = await Promise.all([
        axios.get('/org/departments'),
        axios.get('/org/designations'),
        axios.get('/org/locations'),
        axios.get('/org/employees?status=Active')
      ]);
      setHrStats({
        departments: deptRes.data.length,
        designations: desigRes.data.length,
        locations: locRes.data.length,
        activeEmployees: empRes.data.employees?.length || 0
      });
    } catch (error) {
      console.error('Failed to load HR stats', error);
    } finally {
      setHrLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return toast.error('Please upload an image file');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      const res = await axios.post('/org/employees/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(prev => ({ ...prev, profilePhoto: res.data.profilePhoto }));
      updateUser({ profilePhoto: res.data.profilePhoto });
      toast.success('Profile photo updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get('/org/managers');
      setManagers(res.data);
    } catch (error) {
      console.error('Failed to load managers for delegation', error);
    }
  };

  const handleSaveDelegation = async () => {
    setSavingDelegation(true);
    try {
      await axios.put('/org/employees/me/delegate', {
        delegateId: delegateId || null,
        startDate: delegateStart || null,
        endDate: delegateEnd || null
      });
      toast.success('Delegation updated successfully');
      await fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delegation');
    } finally {
      setSavingDelegation(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    try {
      setPassLoading(true);
      await axios.put('/auth/change-password', passForm);
      toast.success('Password updated successfully');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-accent-gold" size={32} />
      </div>
    );
  }

  if (!profile) return null;

  const photoUrl = profile.profilePhoto ? `${import.meta.env.VITE_API_URL || ''}${profile.profilePhoto}` : null;
  const initials = `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`;
  const isHrAdmin = user?.role === 'HR Admin';
  const isHrManager = user?.role === 'HR Admin' || user?.role === 'Manager';

  const getDelegateName = (delegateId) => {
    if (!delegateId) return 'Not delegated';
    if (typeof delegateId === 'string') {
      const found = managers.find(m => m._id === delegateId);
      return found ? `${found.firstName} ${found.lastName}` : delegateId;
    }
    const firstName = delegateId.firstName || '';
    const lastName = delegateId.lastName || '';
    const name = `${firstName} ${lastName}`.trim();
    if (name) return name;
    return delegateId._id || 'Delegate selected';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-border-light dark:border-border-dark">
        {/* Header Section */}
        <div className="bg-brand-navy dark:bg-gray-900 h-44 md:h-60 w-full relative pb-4">
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6 z-20">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-brand-slate flex items-center justify-center overflow-hidden relative shadow-lg">
                {uploading ? (
                  <Loader2 className="animate-spin text-accent-gold" size={32} />
                ) : photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{initials}</span>
                )}
                
                {/* Camera Overlay */}
                <div 
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="text-white" size={32} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div className="pb-16">
              <h1 className="text-3xl font-serif font-bold text-white mb-1">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full text-sm font-medium border border-accent-gold/30">
                  {user?.role}
                </span>
                <span className="text-gray-300 text-sm">{profile.designationId?.name || 'HR Specialist'}</span>
                {isHrAdmin && (
                  <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm">HR Admin Exclusive</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {isHrAdmin && (
          <>
            <div className="h-20 md:h-24" />
            <div className="px-8 mt-0 mb-6 relative z-10">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border-light dark:border-border-dark p-5 shadow-sm">
                <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-3">
                  <span className="text-sm font-medium">Departments</span>
                  <Building size={20} className="text-accent-gold" />
                </div>
                <p className="text-3xl font-semibold text-text-dark dark:text-text-light">{hrStats.departments}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Organizational units tracked</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border-light dark:border-border-dark p-5 shadow-sm">
                <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-3">
                  <span className="text-sm font-medium">Designations</span>
                  <Briefcase size={20} className="text-accent-gold" />
                </div>
                <p className="text-3xl font-semibold text-text-dark dark:text-text-light">{hrStats.designations}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Roles and titles maintained</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border-light dark:border-border-dark p-5 shadow-sm">
                <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-3">
                  <span className="text-sm font-medium">Locations</span>
                  <MapPin size={20} className="text-accent-gold" />
                </div>
                <p className="text-3xl font-semibold text-text-dark dark:text-text-light">{hrStats.locations}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Office or regional sites</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border-light dark:border-border-dark p-5 shadow-sm">
                <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-3">
                  <span className="text-sm font-medium">Active Employees</span>
                  <UserCircle size={20} className="text-accent-gold" />
                </div>
                <p className="text-3xl font-semibold text-text-dark dark:text-text-light">{hrStats.activeEmployees}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">People currently active</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => navigate('/app/org-setup')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-navy text-white px-4 py-3 font-semibold hover:bg-brand-slate transition"
              >
                <Building size={16} /> Org Setup
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/approvals')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-text-dark px-4 py-3 font-semibold hover:bg-gray-100 transition border border-border-light"
              >
                <CheckSquare size={16} /> Approvals
              </button>
              <button
                type="button"
                onClick={() => navigate('/app/company-reports')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-text-dark px-4 py-3 font-semibold hover:bg-gray-100 transition border border-border-light"
              >
                <BarChart3 size={16} /> Reports
              </button>
            </div>
          </div>
          </>
        )}
        <div className="mt-20 px-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'personal' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab('employment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'employment' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Employment Details
            </button>
            {isHrManager && (
              <button
                onClick={() => setActiveTab('delegation')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'delegation' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                Delegation
              </button>
            )}
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'security' ? 'border-accent-gold text-accent-gold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Account Security
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div 
                key="personal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <Mail size={16} className="text-gray-400" />
                      <span>{profile.userId?.email}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <Phone size={16} className="text-gray-400" />
                      <span>{profile.contactNumber || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{profile.locationId?.name || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'employment' && (
              <motion.div 
                key="employment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Employee ID</h3>
                    <p className="text-text-dark dark:text-text-light font-medium">{profile.employeeId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Department</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <Briefcase size={16} className="text-gray-400" />
                      <span>{profile.departmentId?.name || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reporting Manager</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <UserCircle size={16} className="text-gray-400" />
                      <span>{profile.reportingManagerId ? `${profile.reportingManagerId.firstName} ${profile.reportingManagerId.lastName}` : 'None'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Joining</h3>
                    <div className="flex items-center gap-2 text-text-dark dark:text-text-light">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{new Date(profile.dateOfJoining).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'delegation' && isHrManager && (
              <motion.div
                key="delegation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid gap-6 max-w-3xl">
                  <div className="rounded-3xl border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-900 p-5">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Delegation</h3>
                    <p className="mt-2 text-text-dark dark:text-text-light">
                      {getDelegateName(profile.delegationDelegateId)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {profile.delegationStartDate ? new Date(profile.delegationStartDate).toLocaleDateString() : '-'} to {profile.delegationEndDate ? new Date(profile.delegationEndDate).toLocaleDateString() : '-'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delegate To</label>
                      <select
                        value={delegateId}
                        onChange={(e) => setDelegateId(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                      >
                        <option value="">-- None --</option>
                        {managers.filter(m => m.userId?._id !== user?._id).map(m => (
                          <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                        <input
                          type="date"
                          value={delegateStart}
                          onChange={(e) => setDelegateStart(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                        <input
                          type="date"
                          value={delegateEnd}
                          onChange={(e) => setDelegateEnd(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDelegation}
                      disabled={savingDelegation}
                      className="bg-brand-navy hover:bg-brand-slate text-white px-5 py-3 rounded-2xl font-semibold transition-colors disabled:opacity-70"
                    >
                      {savingDelegation ? 'Saving...' : 'Save Delegation'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-md space-y-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="text-accent-gold" size={24} />
                  <h2 className="text-xl font-semibold text-text-dark dark:text-text-light">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={passForm.currentPassword}
                        onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={passForm.newPassword}
                        onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={passForm.confirmPassword}
                        onChange={(e) => setPassForm({...passForm, confirmPassword: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-700 text-text-dark dark:text-text-light focus:outline-none focus:ring-2 focus:ring-accent-gold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={passLoading}
                    className="mt-6 w-full bg-brand-navy hover:bg-opacity-90 text-white py-2 rounded-md transition-colors flex items-center justify-center font-medium disabled:opacity-70"
                  >
                    {passLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
