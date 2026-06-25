import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Unable to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification read:', error);
      toast.error('Unable to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setRefreshing(true);
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      toast.error('Unable to mark all as read');
    } finally {
      setRefreshing(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      LeaveApplied: '📝',
      LeaveApproved: '✅',
      LeaveRejected: '❌',
      RegularizationApplied: '🕐',
      RegularizationApproved: '✅',
      RegularizationRejected: '❌',
      ApprovalEscalation: '⚠️',
      PendingHRApproval: '⚠️',
      PasswordChanged: '🔐',
      AccountLocked: '🔒',
    };
    return icons[type] || '📢';
  };

  const getRelativeTime = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Bell className="text-accent-gold" size={28} />
          <div>
            <h1 className="text-2xl font-semibold text-text-dark dark:text-text-light">All Notifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Review every notification sent to your account.</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-md border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-text-dark dark:text-text-light hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={refreshing || notifications.length === 0}
            className="inline-flex items-center justify-center rounded-md bg-brand-navy text-white px-4 py-2 text-sm font-medium transition disabled:opacity-60"
          >
            {refreshing ? 'Saving...' : 'Mark all as read'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Clock className="mx-auto mb-4 animate-spin" size={24} />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <Bell size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No notifications yet.</p>
            <p className="mt-2 text-sm">Notifications will appear here when there are updates for your account.</p>
          </div>
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-5 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-700 ${notification.isRead ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex gap-4 items-start">
                    <span className="text-2xl mt-0.5">{getNotificationIcon(notification.type)}</span>
                    <div>
                      <h2 className="font-semibold text-text-dark dark:text-text-light">{notification.title}</h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{notification.type || 'Notification'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRelativeTime(notification.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.isRead ? 'Read' : 'Unread'}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                      className="inline-flex items-center rounded-md bg-brand-navy px-3 py-1 text-xs font-medium text-white hover:bg-brand-slate transition"
                    >
                      <Check size={14} className="mr-1" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
