const { adminService, auctionService } = require('../services');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      search: req.query.search,
      isBanned: req.query.isBanned === 'true' ? true : req.query.isBanned === 'false' ? false : undefined,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await adminService.getAllUsers(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const result = await adminService.banUser(req.params.id, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const unbanUser = async (req, res, next) => {
  try {
    const result = await adminService.unbanUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await adminService.updateUserRole(req.params.id, role, req.user._id);
    res.json({ message: 'User role updated', user });
  } catch (error) {
    next(error);
  }
};

const getAuctions = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      seller: req.query.seller,
      includeRemoved: req.query.includeRemoved === 'true',
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await adminService.getAllAuctions(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeAuction = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const result = await adminService.removeAuction(req.params.id, reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserById,
  banUser,
  unbanUser,
  updateUserRole,
  getAuctions,
  removeAuction,
};
