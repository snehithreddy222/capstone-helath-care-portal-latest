const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create patient profile
async function createPatient(req, res) {
  try {
    const { userId, firstName, lastName, dateOfBirth, gender, phoneNumber, address, bloodGroup, allergies, emergencyContact } = req.body;

    if (!userId || !firstName || !lastName || !dateOfBirth || !gender || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Missing required fields: userId, firstName, lastName, dateOfBirth, gender, phoneNumber' });
    }

    const existingPatient = await prisma.patient.findUnique({ where: { userId } });
    if (existingPatient) {
      return res.status(409).json({ success: false, message: 'Patient profile already exists for this user' });
    }

    const patient = await prisma.patient.create({
      data: {
        userId,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phoneNumber,
        address,
        bloodGroup,
        allergies,
        emergencyContact
      },
      include: { user: { select: { username: true, email: true, role: true } } }
    });

    res.status(201).json({ success: true, message: 'Patient profile created successfully', data: patient });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ success: false, message: 'Error creating patient profile', error: error.message });
  }
}

// ✅ Get "my" patient profile for the logged-in user
async function getMe(req, res) {
  try {
    const userId = req.user.userId;
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: { select: { email: true, username: true, role: true } } }
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found for current user' });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get me (patient) error:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient profile', error: error.message });
  }
}

// Get patient by ID
async function getPatientById(req, res) {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true, role: true } },
        appointments: {
          include: { doctor: { select: { firstName: true, lastName: true, specialization: true } } },
          orderBy: { dateTime: 'desc' }
        },
        medicalRecords: {
          include: { doctor: { select: { firstName: true, lastName: true } } },
          orderBy: { visitDate: 'desc' }
        },
        prescriptions: {
          include: { doctor: { select: { firstName: true, lastName: true } } },
          orderBy: { prescribedDate: 'desc' }
        }
      }
    });

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ success: false, message: 'Error fetching patient', error: error.message });
  }
}

// Get all patients (doctors and admins only)
async function getAllPatients(req, res) {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } }
      ]
    } : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        patients,
        pagination: {
          total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ success: false, message: 'Error fetching patients', error: error.message });
  }
}

// Update patient
async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, address, bloodGroup, allergies, emergencyContact } = req.body;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender }),
        ...(phoneNumber && { phoneNumber }),
        ...(address !== undefined && { address }),
        ...(bloodGroup !== undefined && { bloodGroup }),
        ...(allergies !== undefined && { allergies }),
        ...(emergencyContact !== undefined && { emergencyContact })
      },
      include: { user: { select: { username: true, email: true } } }
    });

    res.status(200).json({ success: true, message: 'Patient updated successfully', data: updatedPatient });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ success: false, message: 'Error updating patient', error: error.message });
  }
}

// Delete patient
async function deletePatient(req, res) {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    await prisma.patient.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ success: false, message: 'Error deleting patient', error: error.message });
  }
}

module.exports = {
  createPatient,
  getMe,               // ✅ export
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient
};
