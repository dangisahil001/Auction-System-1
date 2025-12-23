const { notificationService } = require('../services');

const getNotifications = async (req, res, next) => {
  try {
    const filters = {
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      limit: req.query.limit,
      page: req.query.page,
    };

    const result = await notificationService.getUserNotifications(req.user._id, filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);
    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user._id);
    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
