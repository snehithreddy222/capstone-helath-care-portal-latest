const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    const userCount = await prisma.user.count();
    console.log(`Users in database: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();