const Notification = require('../models/Notification');
const Employee = require('../models/Employee');
const User = require('../models/User');

// Critical/security notification types that cannot be disabled
const CRITICAL_NOTIFICATION_TYPES = ['PasswordChanged', 'AccountLocked'];

// Check if a notification should be created based on user preferences
const shouldCreateNotification = async (userId, notificationType) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.notificationPreferences) {
      // Default to true if user/preferences not found
      return true;
    }

    // Critical notifications always go through
    if (CRITICAL_NOTIFICATION_TYPES.includes(notificationType)) {
      return true;
    }

    // Check if user has disabled this notification type for in-app
    const prefs = user.notificationPreferences[notificationType];
    if (!prefs) {
      // If preference doesn't exist, create it (default is enabled)
      return true;
    }

    // Return true if either email or in-app is enabled
    return prefs.email || prefs.inApp;
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to creating notification on error
  }
};

const createNotificationForEmployee = async (tenantId, employeeId, title, message, type, link = '') => {
  try {
    let employee = await Employee.findById(employeeId).populate('userId');
    let userId = employee?.userId?._id;

    if (!userId) {
      // Fallback to direct userId if an employee record is not available
      const user = await User.findOne({ _id: employeeId, tenantId });
      if (!user) return null;
      userId = user._id;
    }

    // Check preferences before creating
    const shouldCreate = await shouldCreateNotification(userId, type);
    if (!shouldCreate) {
      return null;
    }

    const notification = new Notification({
      tenantId,
      userId,
      title,
      message,
      type,
      link,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification for employee:', error);
    return null;
  }
};

const notifyUsersByRoles = async (tenantId, roles, title, message, type, link = '') => {
  try {
    const users = await User.find({ tenantId, role: { $in: roles }, isActive: true });
    const notifications = [];

    for (const user of users) {
      const shouldCreate = await shouldCreateNotification(user._id, type);
      if (shouldCreate) {
        notifications.push({
          tenantId,
          userId: user._id,
          title,
          message,
          type,
          link,
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    return true;
  } catch (error) {
    console.error('Error notifying users by role:', error);
    return false;
  }
};

const notifyHRAdmins = async (tenantId, title, message, type, link = '') => {
  return notifyUsersByRoles(tenantId, ['HR Admin'], title, message, type, link);
};

const notifyManager = async (tenantId, managerEmployeeId, title, message, type, link = '') => {
  return createNotificationForEmployee(tenantId, managerEmployeeId, title, message, type, link);
};

module.exports = {
  createNotificationForEmployee,
  notifyHRAdmins,
  notifyManager,
  shouldCreateNotification,
  CRITICAL_NOTIFICATION_TYPES
};
