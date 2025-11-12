const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIs() {
  try {
    console.log('🧪 Testing Database Connections...\n');

    // Count records
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();

    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Patients: ${patientCount}`);
    console.log(`   Doctors: ${doctorCount}`);
    console.log(`   Appointments: ${appointmentCount}\n`);

    // List users
    console.log('👥 Users:');
    const users = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    });
    console.table(users);

    // List patients
    if (patientCount > 0) {
      console.log('\n🏥 Patients:');
      const patients = await prisma.patient.findMany({
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          bloodGroup: true
        }
      });
      console.table(patients);
    }

    // List doctors
    if (doctorCount > 0) {
      console.log('\n🩺 Doctors:');
      const doctors = await prisma.doctor.findMany({
        select: {
          firstName: true,
          lastName: true,
          specialization: true,
          yearsExperience: true
        }
      });
      console.table(doctors);
    }

    // List appointments
    if (appointmentCount > 0) {
      console.log('\n📅 Appointments:');
      const appointments = await prisma.appointment.findMany({
        select: {
          dateTime: true,
          status: true,
          reason: true
        }
      });
      console.table(appointments);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIs();