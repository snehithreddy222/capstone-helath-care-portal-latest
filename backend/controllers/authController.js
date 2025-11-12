// backend/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

// Register new user
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, email, password, role',
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: role.toUpperCase() },
    });

    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
}

// Login user
async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, password',
      });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(user.id, user.role);

    // 🔎 Add linked ids for convenience
    const [patientRecord, doctorRecord] = await Promise.all([
      prisma.patient.findFirst({ where: { userId: user.id }, select: { id: true } }),
      prisma.doctor.findFirst({ where: { userId: user.id }, select: { id: true } }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
        patientId: patientRecord?.id || null,
        doctorId: doctorRecord?.id || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // include the ids here too
    const [patientRecord, doctorRecord] = await Promise.all([
      prisma.patient.findFirst({ where: { userId }, select: { id: true } }),
      prisma.doctor.findFirst({ where: { userId }, select: { id: true } }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        patientId: patientRecord?.id || null,
        doctorId: doctorRecord?.id || null,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Missing currentPassword or newPassword',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const ok = await comparePassword(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message,
    });
  }
}

module.exports = { register, login, getProfile, changePassword };
