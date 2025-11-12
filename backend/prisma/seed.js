// Seed script to populate database with sample doctors
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
    console.log('\n📝 Please create a .env file in the backend directory with:');
    console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"');
    process.exit(1);
  }

  // Hash password for all doctor accounts
  const hashedPassword = await bcrypt.hash('Doctor@123', 10);

  // Create 5 doctors with different specializations
  const doctors = [
    {
      user: {
        username: 'dr.sarah.johnson',
        email: 'sarah.johnson@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
      doctor: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        specialization: 'Cardiology',
        licenseNumber: 'MD-CARD-2024-001',
        phoneNumber: '+1-555-0101',
        yearsExperience: 12,
      },
    },
    {
      user: {
        username: 'dr.michael.chen',
        email: 'michael.chen@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
      doctor: {
        firstName: 'Michael',
        lastName: 'Chen',
        specialization: 'Orthopedics',
        licenseNumber: 'MD-ORTH-2024-002',
        phoneNumber: '+1-555-0102',
        yearsExperience: 15,
      },
    },
    {
      user: {
        username: 'dr.priya.patel',
        email: 'priya.patel@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
      doctor: {
        firstName: 'Priya',
        lastName: 'Patel',
        specialization: 'Pediatrics',
        licenseNumber: 'MD-PEDI-2024-003',
        phoneNumber: '+1-555-0103',
        yearsExperience: 8,
      },
    },
    {
      user: {
        username: 'dr.james.williams',
        email: 'james.williams@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
      doctor: {
        firstName: 'James',
        lastName: 'Williams',
        specialization: 'Neurology',
        licenseNumber: 'MD-NEUR-2024-004',
        phoneNumber: '+1-555-0104',
        yearsExperience: 20,
      },
    },
    {
      user: {
        username: 'dr.emily.martinez',
        email: 'emily.martinez@hospital.com',
        password: hashedPassword,
        role: 'DOCTOR',
      },
      doctor: {
        firstName: 'Emily',
        lastName: 'Martinez',
        specialization: 'Dermatology',
        licenseNumber: 'MD-DERM-2024-005',
        phoneNumber: '+1-555-0105',
        yearsExperience: 10,
      },
    },
  ];

  // Create each doctor
  for (const doctorData of doctors) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: doctorData.user.email },
      });

      if (existingUser) {
        console.log(`⚠️  Doctor ${doctorData.doctor.firstName} ${doctorData.doctor.lastName} already exists, skipping...`);
        continue;
      }

      // Create user first
      const user = await prisma.user.create({
        data: doctorData.user,
      });

      // Then create doctor profile
      await prisma.doctor.create({
        data: {
          userId: user.id,
          ...doctorData.doctor,
        },
      });

      console.log(`✅ Created Dr. ${doctorData.doctor.firstName} ${doctorData.doctor.lastName} - ${doctorData.doctor.specialization}`);
    } catch (error) {
      console.error(`❌ Error creating doctor ${doctorData.doctor.firstName} ${doctorData.doctor.lastName}:`, error.message);
    }
  }

  console.log('\n📊 Seed Summary:');
  const totalDoctors = await prisma.doctor.count();
  const totalUsers = await prisma.user.count();
  console.log(`   Total Doctors: ${totalDoctors}`);
  console.log(`   Total Users: ${totalUsers}`);
  console.log('\n✨ Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
