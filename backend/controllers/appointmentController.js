const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ---------- Helpers ----------
function doctorSelect() {
  return { select: { id: true, firstName: true, lastName: true, specialization: true } };
}

// ---------- Create appointment ----------
async function createAppointment(req, res) {
  try {
    let { patientId, doctorId, dateTime, reason, notes } = req.body;
    
    // If patientId is not provided, try to get it from the logged-in user
    if (!patientId && req.user) {
      const patient = await prisma.patient.findFirst({ 
        where: { userId: req.user.userId },
        select: { id: true }
      });
      if (patient) {
        patientId = patient.id;
      }
    }
    
    if (!patientId || !doctorId || !dateTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields: patientId, doctorId, dateTime' });
    }

    // Verify patient & doctor exist
    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({ where: { id: patientId } }),
      prisma.doctor.findUnique({ where: { id: doctorId } }),
    ]);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    const when = new Date(dateTime);
    if (when < new Date()) return res.status(400).json({ success: false, message: 'Appointment date must be in the future' });

    const conflict = await prisma.appointment.findFirst({
      where: { doctorId, dateTime: when, status: 'SCHEDULED' },
    });
    if (conflict) return res.status(409).json({ success: false, message: 'Doctor already has an appointment at this time' });

    const appt = await prisma.appointment.create({
      data: { patientId, doctorId, dateTime: when, reason, notes, status: 'SCHEDULED' },
      include: { doctor: doctorSelect() },
    });

    return res.status(201).json({ success: true, message: 'Appointment created successfully', data: appt });
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ success: false, message: 'Error creating appointment', error: error.message });
  }
}

// ---------- NEW: get appointments for the logged-in user ----------
async function getMyAppointments(req, res) {
  try {
    const userId = req.user.userId; // set by authenticateToken
    const { status } = req.query;   // optional filter (SCHEDULED, COMPLETED, CANCELLED)

    // Find patient profile for this user
    const patient = await prisma.patient.findFirst({ where: { userId }, select: { id: true } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'No patient profile linked to this user' });
    }

    const where = { patientId: patient.id };
    if (status) where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      include: { doctor: doctorSelect() },
      orderBy: { dateTime: 'asc' },
    });

    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
}

// ---------- Get appointment by ID ----------
async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { firstName: true, lastName: true, phoneNumber: true, dateOfBirth: true, gender: true } },
        doctor: doctorSelect(),
      },
    });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    return res.status(200).json({ success: true, data: appt });
  } catch (error) {
    console.error('Get appointment error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching appointment', error: error.message });
  }
}

// ---------- List appointments (admin/doctor tools; supports filters) ----------
async function getAllAppointments(req, res) {
  try {
    const { page = 1, limit = 10, status, patientId, doctorId, date } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.dateTime = { gte: start, lt: end };
    }

    const [items, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: { doctor: doctorSelect(), patient: { select: { firstName: true, lastName: true } } },
        orderBy: { dateTime: 'asc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        appointments: items,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error('Get all appointments error:', error);
    return res.status(500).json({ success: false, message: 'Error fetching appointments', error: error.message });
  }
}

// ---------- Update appointment ----------
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { dateTime, status, reason, notes } = req.body;

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (dateTime) {
      const when = new Date(dateTime);
      if (when < new Date()) return res.status(400).json({ success: false, message: 'Appointment date must be in the future' });

      const conflict = await prisma.appointment.findFirst({
        where: { id: { not: id }, doctorId: appt.doctorId, dateTime: when, status: 'SCHEDULED' },
      });
      if (conflict) return res.status(409).json({ success: false, message: 'Doctor already has an appointment at this time' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(status && { status }),
        ...(reason !== undefined && { reason }),
        ...(notes !== undefined && { notes }),
      },
      include: { doctor: doctorSelect() },
    });

    return res.status(200).json({ success: true, message: 'Appointment updated successfully', data: updated });
  } catch (error) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ success: false, message: 'Error updating appointment', error: error.message });
  }
}

// ---------- Cancel appointment ----------
async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { doctor: doctorSelect() },
    });

    return res.status(200).json({ success: true, message: 'Appointment cancelled successfully', data: updated });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({ success: false, message: 'Error cancelling appointment', error: error.message });
  }
}

// ---------- Delete appointment ----------
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    await prisma.appointment.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    return res.status(500).json({ success: false, message: 'Error deleting appointment', error: error.message });
  }
}

module.exports = {
  createAppointment,
  getMyAppointments,        // <-- NEW
  getAppointmentById,
  getAllAppointments,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
};
