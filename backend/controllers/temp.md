const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create appointment
async function createAppointment(req, res) {
  try {
    const { patientId, doctorId, dateTime, reason, notes } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientId, doctorId, dateTime'
      });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if appointment time is in the future
    const appointmentDate = new Date(dateTime);
    if (appointmentDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future'
      });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        dateTime: appointmentDate,
        status: 'SCHEDULED'
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Doctor already has an appointment at this time'
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        dateTime: appointmentDate,
        reason,
        notes,
        status: 'SCHEDULED'
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
}

// Get appointment by ID
async function getAppointmentById(req, res) {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true,
            dateOfBirth: true,
            gender: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
}

// Get all appointments
async function getAllAppointments(req, res) {
  try {
    const { page = 1, limit = 10, status, patientId, doctorId, date } = req.query;
    const skip = (page - 1) * limit;

    let where = {};

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.dateTime = {
        gte: startDate,
        lt: endDate
      };
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          },
          doctor: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true
            }
          }
        },
        orderBy: { dateTime: 'asc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
}

// Update appointment
async function updateAppointment(req, res) {
  try {
    const { id } = req.params;
    const { dateTime, status, reason, notes } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // If updating dateTime, check for conflicts
    if (dateTime) {
      const newDateTime = new Date(dateTime);

      if (newDateTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Appointment date must be in the future'
        });
      }

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          doctorId: appointment.doctorId,
          dateTime: newDateTime,
          status: 'SCHEDULED'
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({
          success: false,
          message: 'Doctor already has an appointment at this time'
        });
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(status && { status }),
        ...(reason !== undefined && { reason }),
        ...(notes !== undefined && { notes })
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message
    });
  }
}

// Cancel appointment
async function cancelAppointment(req, res) {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        doctor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
}

// Delete appointment
async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message
    });
  }
}

module.exports = {
  createAppointment,
  getAppointmentById,
  getAllAppointments,
  updateAppointment,
  cancelAppointment,
  deleteAppointment
};

-----------------------
const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

// Register new user
async function register(req, res) {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, email, password, role'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role.toUpperCase()
      }
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
}

// Login user
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, password'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
}

// Get current user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
}

module.exports = { register, login, getProfile };
------------------
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create doctor profile
async function createDoctor(req, res) {
  try {
    const { userId, firstName, lastName, specialization, licenseNumber, phoneNumber, yearsExperience } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName || !specialization || !licenseNumber || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, firstName, lastName, specialization, licenseNumber, phoneNumber'
      });
    }

    // Check if doctor profile already exists
    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        OR: [
          { userId },
          { licenseNumber }
        ]
      }
    });

    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message: 'Doctor profile already exists or license number is in use'
      });
    }

    // Create doctor
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
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating doctor profile',
      error: error.message
    });
  }
}

// Get doctor by ID
async function getDoctorById(req, res) {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        },
        appointments: {
          include: {
            patient: {
              select: {
                firstName: true,
                lastName: true,
                phoneNumber: true
              }
            }
          },
          orderBy: { dateTime: 'desc' }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Calculate appointment statistics
    const stats = {
      totalAppointments: doctor.appointments.length,
      scheduledAppointments: doctor.appointments.filter(a => a.status === 'SCHEDULED').length,
      completedAppointments: doctor.appointments.filter(a => a.status === 'COMPLETED').length
    };

    res.status(200).json({
      success: true,
      data: {
        ...doctor,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
}

// Get all doctors
async function getAllDoctors(req, res) {
  try {
    const { page = 1, limit = 10, specialization, search } = req.query;
    const skip = (page - 1) * limit;

    let where = {};

    if (specialization) {
      where.specialization = { contains: specialization, mode: 'insensitive' };
    }

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
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.doctor.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
}

// Update doctor
async function updateDoctor(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, specialization, licenseNumber, phoneNumber, yearsExperience } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if license number is being changed and if it's already in use
    if (licenseNumber && licenseNumber !== doctor.licenseNumber) {
      const existingLicense = await prisma.doctor.findUnique({
        where: { licenseNumber }
      });

      if (existingLicense) {
        return res.status(409).json({
          success: false,
          message: 'License number already in use'
        });
      }
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
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: updatedDoctor
    });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating doctor',
      error: error.message
    });
  }
}

// Delete doctor
async function deleteDoctor(req, res) {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await prisma.doctor.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting doctor',
      error: error.message
    });
  }
}

module.exports = {
  createDoctor,
  getDoctorById,
  getAllDoctors,
  updateDoctor,
  deleteDoctor
};
-------------------
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create patient profile
async function createPatient(req, res) {
  try {
    const { userId, firstName, lastName, dateOfBirth, gender, phoneNumber, address, bloodGroup, allergies, emergencyContact } = req.body;

    // Validate required fields
    if (!userId || !firstName || !lastName || !dateOfBirth || !gender || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, firstName, lastName, dateOfBirth, gender, phoneNumber'
      });
    }

    // Check if patient profile already exists for this user
    const existingPatient = await prisma.patient.findUnique({
      where: { userId }
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: 'Patient profile already exists for this user'
      });
    }

    // Create patient
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
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: patient
    });

  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating patient profile',
      error: error.message
    });
  }
}

// Get patient by ID
async function getPatientById(req, res) {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true
          }
        },
        appointments: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true
              }
            }
          },
          orderBy: { dateTime: 'desc' }
        },
        medicalRecords: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { visitDate: 'desc' }
        },
        prescriptions: {
          include: {
            doctor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { prescribedDate: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });

  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient',
      error: error.message
    });
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
        include: {
          user: {
            select: {
              username: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.patient.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: {
        patients,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
}

// Update patient
async function updatePatient(req, res) {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, phoneNumber, address, bloodGroup, allergies, emergencyContact } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

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
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient
    });

  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
}

// Delete patient
async function deletePatient(req, res) {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await prisma.patient.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting patient',
      error: error.message
    });
  }
}

module.exports = {
  createPatient,
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient
};