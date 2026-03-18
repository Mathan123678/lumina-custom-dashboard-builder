const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { models: { User } } = require("../db");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check for user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    let user;
    const { isMock } = require('../db').models;
    
    if (isMock) {
      // Hash password even in JSON persistence mode
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      user = await new User({ name, email, password: hashed }).save();
    } else {
      user = await User.create({ name, email, password });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    let user;
    const { isMock } = require('../db').models;
    
    if (isMock) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    let isMatch;
    if (isMock) {
      // Support both legacy plaintext users and new hashed users
      const stored = String(user.password || '');
      if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
        isMatch = await bcrypt.compare(password, stored);
      } else {
        isMatch = (stored === password);
      }
    } else {
      isMatch = await user.matchPassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email
    }
  });
};