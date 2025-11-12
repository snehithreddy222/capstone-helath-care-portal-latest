// Fix: Create patient profiles for existing PATIENT users
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('🔍 Looking for PATIENT users without patient profiles...\n');
  
  const patientUsers = await prisma.user.findMany({
    where: { role: 'PATIENT' }
  });
  
  let created = 0;
  
  for (const user of patientUsers) {
    const existingPatient = await prisma.patient.findFirst({
      where: { userId: user.id }
    });
    
    if (!existingPatient) {
      const nameParts = user.username.split(/[._\s]+/);
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts[1] || 'User';
      
      await prisma.patient.create({
        data: {
          userId: user.id,
          firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
          lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
          dateOfBirth: new Date('1990-01-01'),
          gender: 'OTHER',
          phoneNumber: '000-000-0000',
          address: 'Not provided',
          emergencyContact: 'Not provided'
        }
      });
      
      console.log(`✅ Created patient profile for: ${user.username}`);
      created++;
    }
  }
  
  console.log(`\n📊 Total patient profiles created: ${created}`);
  console.log(`📊 Total PATIENT users: ${patientUsers.length}`);
  
  await prisma.$disconnect();
})();
