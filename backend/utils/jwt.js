const jwt = require('jsonwebtoken');

const JWT_SECRET = 'healthcare-portal-secret-key-2025';
const JWT_EXPIRES_IN = '7d';

function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };