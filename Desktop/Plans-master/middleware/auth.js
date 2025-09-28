const jwt = require('jsonwebtoken');
const { getRow, runQuery } = require('../config/database');
require('dotenv').config();

// JWT Secret keys
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_here';

// Generate JWT token (10 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '10m' });
};

// Generate refresh token (7 days)
const generateRefreshToken = (userId, deviceInfo = '') => {
  return jwt.sign({ userId, deviceInfo }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Verify JWT token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Check if token is blacklisted
  const blacklistedToken = await getRow(
    'SELECT * FROM blacklisted_tokens WHERE token = ?',
    [token]
  );

  if (blacklistedToken) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Get user info
  const user = await getRow('SELECT id, email, phone FROM users WHERE id = ?', [decoded.userId]);
  if (!user) {
    return res.status(403).json({ error: 'User not found' });
  }

  req.user = user;
  next();
};

// Store refresh token in database
const storeRefreshToken = async (userId, refreshToken, deviceInfo = '') => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await runQuery(
    'INSERT INTO refresh_tokens (user_id, token, device_info, expires_at) VALUES (?, ?, ?, ?)',
    [userId, refreshToken, deviceInfo, expiresAt.toISOString()]
  );
};

// Revoke refresh token
const revokeRefreshToken = async (refreshToken) => {
  await runQuery(
    'UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ?',
    [refreshToken]
  );
};

// Blacklist access token
const blacklistToken = async (token, userId) => {
  await runQuery(
    'INSERT INTO blacklisted_tokens (token, user_id) VALUES (?, ?)',
    [token, userId]
  );
};

// Get device info from request
const getDeviceInfo = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  return `${userAgent.substring(0, 100)} | IP: ${ip}`;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  authenticateToken,
  storeRefreshToken,
  revokeRefreshToken,
  blacklistToken,
  getDeviceInfo
};
