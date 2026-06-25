import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Sun, Users, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';

const NOTIFICATION_TYPES = {
  // Toggleable notifications
  LeaveApplied: { label: 'Leave Applied', category: 'Leave', critical: false },
  LeaveApproved: { label: 'Leave Approved', category: 'Leave', critical: false },
  LeaveRejected: { label: 'Leave Rejected', category: 'Leave', critical: false },
  RegularizationApplied: { label: 'Regularization Applied', category: 'Attendance', critical: false },
  RegularizationApproved: { label: 'Regularization Approved', category: 'Attendance', critical: false },
  RegularizationRejected: { label: 'Regularization Rejected', category: 'Attendance', critical: false },
  ApprovalEscalation: { label: 'Approval Escalation', category: 'Approvals', critical: false },
  // Critical notifications (cannot be disabled)
  PasswordChanged: { label: 'Password Changed', category: 'Security', critical: true },
  AccountLocked: { label: 'Account Locked', category: 'Security', critical: true },
};

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({});
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [managers, setManagers] = useState([]);
  const [delegateId, setDelegateId] = useState('');
  const [delegateStart, setDelegateStart] = useState('');
  const [delegateEnd, setDelegateEnd] = useState('');
  const [savingDelegation, setSavingDelegation] = useState(false);

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await api.get('/notifications/preferences/me');
        setPreferences(res.data);
        setLoadingPrefs(false);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        // Initialize with defaults
        const defaults = {};
        Object.keys(NOTIFICATION_TYPES).forEach(key => {
          defaults[key] = { email: true, inApp: true };
        });
        setPreferences(defaults);
        setLoadingPrefs(false);
      }
    };
    fetchPreferences();
  }, []);

  // Fetch delegation data for managers
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'Manager' || user.role === 'HR Admin' || user.role === 'Leadership') {
          const mgrRes = await api.get('/org/managers');
          setManagers(mgrRes.data);

          const meRes = await api.get('/org/employees/me');
          if (meRes.data.delegationDelegateId) {
            setDelegateId(meRes.data.delegationDelegateId);
            setDelegateStart(meRes.data.delegationStartDate ? meRes.data.delegationStartDate.split('T')[0] : '');
            setDelegateEnd(meRes.data.delegationEndDate ? meRes.data.delegationEndDate.split('T')[0] : '');
          }
        }
      } catch (error) {
        console.error('Error fetching data for settings:', error);
      }
    };
    fetchData();
  }, [user.role]);

  const handlePreferenceChange = (notifType, channel, value) => {
    setPreferences(prev => ({
      ...prev,
      [notifType]: {
        ...prev[notifType],
        [channel]: value
      }
    }));
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      await api.put('/notifications/preferences/me', { preferences });
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveDelegation = async () => {
    setSavingDelegation(true);
    try {
      await api.put('/org/employees/me/delegate', {
        delegateId: delegateId || null,
        startDate: delegateStart || null,
        endDate: delegateEnd || null
      });
      toast.success('Delegation settings updated');
    } catch (error) {
      toast.error('Failed to update delegation settings');
    } finally {
      setSavingDelegation(false);
    }
  };

  // Group notifications by category
  const groupedNotifications = {};
  Object.entries(NOTIFICATION_TYPES).forEach(([key, config]) => {
    if (!groupedNotifications[config.category]) {
      groupedNotifications[config.category] = [];
    }
    groupedNotifications[config.category].push({ key, ...config });
  });

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2 mb-8">
        <SettingsIcon className="text-accent-gold" /> Settings
      </h1>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center gap-3">
            <Sun className="text-accent-gold" />
            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark dark:text-text-light">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark mode interface</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-accent-gold' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
          <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center gap-3">
            <Bell className="text-accent-gold" />
            <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">Notification Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            {loadingPrefs ? (
              <p className="text-gray-500">Loading preferences...</p>
            ) : (
              <>
                {/* Toggleable Notifications */}
                {Object.entries(groupedNotifications).map(([category, notifs]) => (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      {category === 'Security' ? (
                        <Shield className="text-red-500" size={18} />
                      ) : (
                        <Bell className="text-accent-gold" size={18} />
                      )}
                      <h3 className="font-semibold text-text-dark dark:text-text-light">{category}</h3>
                      {category === 'Security' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded dark:bg-red-900/30 dark:text-red-400">
                          Always On
                        </span>
                      )}
                    </div>

                    <div className="space-y-4 mb-6 ml-6">
                      {notifs.map(({ key, label, critical }) => (
                        <div key={key} className="border border-border-light dark:border-border-dark rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-text-dark dark:text-text-light flex items-center gap-2">
                                {label}
                                {critical && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                                    Critical
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {critical ? 'This security notification cannot be disabled' : 'Configure how you want to receive this notification'}
                              </p>
                            </div>

                            <div className="flex gap-4 items-start">
                              {/* Email Toggle */}
                              <div className="flex flex-col items-center gap-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
                                <button
                                  disabled={critical}
                                  onClick={() => handlePreferenceChange(key, 'email', !preferences[key]?.email)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    preferences[key]?.email ? 'bg-accent-gold' : 'bg-gray-300 dark:bg-gray-600'
                                  } ${critical ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key]?.email ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                              </div>

                              {/* In-App Toggle */}
                              <div className="flex flex-col items-center gap-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">In-App</label>
                                <button
                                  disabled={critical}
                                  onClick={() => handlePreferenceChange(key, 'inApp', !preferences[key]?.inApp)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    preferences[key]?.inApp ? 'bg-accent-gold' : 'bg-gray-300 dark:bg-gray-600'
                                  } ${critical ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences[key]?.inApp ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={savingPrefs}
                    className="bg-brand-navy hover:bg-brand-slate text-white px-6 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-60"
                  >
                    {savingPrefs ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delegation Settings */}
        {(user.role === 'Manager' || user.role === 'HR Admin' || user.role === 'Leadership') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center gap-3">
              <Users className="text-accent-gold" />
              <h2 className="text-lg font-semibold text-text-dark dark:text-text-light">Approval Delegation</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Delegate your approval tasks to another manager for a specific date range.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delegate To</label>
                <select
                  value={delegateId}
                  onChange={(e) => setDelegateId(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                >
                  <option value="">-- None --</option>
                  {managers.map(m => (
                    <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={delegateStart}
                    onChange={(e) => setDelegateStart(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={delegateEnd}
                    onChange={(e) => setDelegateEnd(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleSaveDelegation}
                  disabled={savingDelegation}
                  className="bg-brand-navy hover:bg-brand-slate text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                >
                  {savingDelegation ? 'Saving...' : 'Save Delegation'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
