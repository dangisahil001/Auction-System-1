const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async register(userData) {
    const { email, password, firstName, lastName, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    // Create user (only allow bidder and seller roles on registration)
    const allowedRoles = ['bidder', 'seller'];
    const userRole = allowedRoles.includes(role) ? role : 'bidder';

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: userRole,
    });

    await user.save();

    const tokens = this.generateTokens(user);
    
    // Save refresh token to user
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.isBanned) {
      const error = new Error('Your account has been banned');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const tokens = this.generateTokens(user);
    
    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token required');
      error.statusCode = 401;
      throw error;
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || user.refreshToken !== refreshToken) {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
      }

      if (user.isBanned) {
        const error = new Error('Your account has been banned');
        error.statusCode = 403;
        throw error;
      }

      const tokens = this.generateTokens(user);
      
      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return { user, ...tokens };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const err = new Error('Refresh token expired');
        err.statusCode = 401;
        throw err;
      }
      throw error;
    }
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const { firstName, lastName, avatar } = updateData;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();
