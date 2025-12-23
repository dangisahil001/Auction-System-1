const { Notification } = require('../models');
const { getIO } = require('../config/socket');

class NotificationService {
  async createNotification({ userId, type, title, message, auctionId, metadata }) {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      auction: auctionId,
      metadata,
    });

    await notification.save();

    // Emit real-time notification
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification', {
        id: notification._id,
        type,
        title,
        message,
        auctionId,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      console.error('Socket emit error:', err);
    }

    return notification;
  }

  async getUserNotifications(userId, filters = {}) {
    const { isRead, limit = 20, page = 1 } = filters;

    const query = { user: userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('auction', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId) {
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  // Send notification to multiple users
  async notifyUsers(userIds, notificationData) {
    const notifications = userIds.map((userId) => ({
      user: userId,
      ...notificationData,
    }));

    await Notification.insertMany(notifications);

    // Emit to all users
    try {
      const io = getIO();
      userIds.forEach((userId) => {
        io.to(`user:${userId}`).emit('notification', {
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          auctionId: notificationData.auction,
          createdAt: new Date(),
        });
      });
    } catch (err) {
      console.error('Socket emit error:', err);
    }
  }
}

module.exports = new NotificationService();
