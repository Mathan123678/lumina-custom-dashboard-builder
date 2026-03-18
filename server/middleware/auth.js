const jwt = require('jsonwebtoken');
const { models: { User } } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
}

async function attachUserFromToken(token, req, res, next) {
  if (!token) return res.status(401).json({ message: 'Not authorized to access this route' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id });
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
}

// Protect normal REST endpoints (expects Authorization: Bearer <token>)
exports.protect = (req, res, next) => attachUserFromToken(getBearerToken(req), req, res, next);

// EventSource can't reliably send Authorization headers, so we allow ?token=... for SSE only.
exports.protectSse = (req, res, next) =>
  attachUserFromToken(getBearerToken(req) || req.query?.token, req, res, next);
