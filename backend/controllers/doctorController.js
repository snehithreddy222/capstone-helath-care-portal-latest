// controllers/doctorController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lightweight list for UI selects (no pagination)
 * GET /api/doctors
 */
async function listDoctors(req, res) {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        specialization: true,
        licenseNumber: true,
        phoneNumber: true,
        yearsExperience: true
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });

    const normalized = doctors.map(d => ({
      ...d,
      name: [d.firstName, d.lastName].filter(Boolean).join(' ').trim()
    }));

    return res.json({ success: true, data: normalized });
  } catch (error) {
    console.error('listDoctors error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
}

/**
 * Your original CRUD/Search below
 */

async function createDoctor(req, res) {
  try {
    const { userId, firstName, lastName, specialization, licenseNumber, phoneNumber, yearsExperience } = req.body;

    if (!userId || !firstName || !lastName || !specialization || !licenseNumber || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, firstName, lastName, specialization, licenseNumber, phoneNumber'
      });
    }

    const existingDoctor = await prisma.doctor.findFirst({
      where: { OR: [{ userId }, { licenseNumber }] }
    });

    if (existingDoctor) {
      return res.status(409).json({ success: false, message: 'Doctor profile already exists or license number is in use' });
    }

    const doctor = await prisma.doctor.create({
      data: {
        userId,
        firstName,
        lastName,
        specialization,
        licenseNumber,
        phoneNumber,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null
      },
      include: { user: { select: { username: true, email: true, role: true } } }
    });

    return res.status(201).json({ success: true, message: 'Doctor profile created successfully', data: doctor });
  } catch (error) {
    console.error('Create doctor error:', error);
    return res.status(500).json({ success: false, message: 'Error creating doctor profile', error: error.message });
  }
}

async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, email: true, role: true } },
        appointments: {
          include: { patient: { select: { firstName: true, lastName: true, phoneNumber: true } } },
          orderBy: { dateTime: 'desc' }
        }
      }
    });

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const stats = {
      totalAppointments: doctor.appointments.length,
      scheduledAppointments: doctor.appointments.filter(a => a.status === 'SCHEDULED').length,
      completedAppointments: doctor.appointments.filter(a => a.status === 'COMPLETED').length
    };

    return res.status(200).json({ success: true, data: { ...doctor, statistics: stats } });
  } catch (error) {
    console.error('Get doctor error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching doctor', error: error.message });
  }
}

async function getAllDoctors(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;
    const { specialization, search } = req.query;

    const where = {};
    if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.doctor.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: { doctors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }
    });
  } catch (error) {
    console.error('Get all doctors error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching doctors', error: error.message });
  }
}

async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, specialization, licenseNumber, phoneNumber, yearsExperience } = req.body;

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await prisma.doctor.findUnique({ where: { licenseNumber } });
      if (existingLicense) return res.status(409).json({ success: false, message: 'License number already in use' });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(specialization && { specialization }),
        ...(licenseNumber && { licenseNumber }),
        ...(phoneNumber && { phoneNumber }),
        ...(yearsExperience !== undefined && { yearsExperience: parseInt(yearsExperience) })
      },
      include: { user: { select: { username: true, email: true } } }
    });

    return res.status(200).json({ success: true, message: 'Doctor updated successfully', data: updatedDoctor });
  } catch (error) {
    console.error('Update doctor error:', error);
    return res.status(500).json({ success: false, message: 'Error updating doctor', error: error.message });
  }
}

async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    await prisma.doctor.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting doctor', error: error.message });
  }
}

module.exports = {
  listDoctors,       // simple list
  createDoctor,
  getDoctorById,
  getAllDoctors,     // paginated/search
  updateDoctor,
  deleteDoctor
};
