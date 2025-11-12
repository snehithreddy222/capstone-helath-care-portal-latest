#!/bin/bash

# Healthcare Portal - Doctor Seed Setup Script
# This script helps you set up the database and seed doctors

echo "🏥 Healthcare Portal - Doctor Seed Setup"
echo "=========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd backend && bash setup-doctors.sh"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo ""
    echo "📝 Creating .env file from template..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created!"
        echo ""
        echo "⚙️  Please edit .env and update DATABASE_URL with your credentials:"
        echo "   nano .env"
        echo ""
        echo "   Example:"
        echo "   DATABASE_URL=\"postgresql://postgres:your_password@localhost:5432/healthcare_portal\""
        echo ""
        read -p "Press Enter after updating .env file..."
    else
        echo "❌ .env.example not found"
        exit 1
    fi
fi

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "🔧 Step 2: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🗄️  Step 3: Running database migrations..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Migration failed. Please check your DATABASE_URL in .env"
    exit 1
fi
echo "✅ Migrations completed"
echo ""

echo "🌱 Step 4: Seeding database with doctors..."
npm run seed
if [ $? -ne 0 ]; then
    echo "❌ Seed failed. Please check error messages above"
    exit 1
fi
echo ""

echo "✅ Setup Complete!"
echo ""
echo "🎉 5 doctors have been added to your database!"
echo ""
echo "👨‍⚕️ You can now:"
echo "   1. Start the server: node server.js"
echo "   2. View doctors in Prisma Studio: npx prisma studio"
echo "   3. Test API: curl http://localhost:3000/api/doctors"
echo ""
echo "🔐 Doctor Login Credentials:"
echo "   Username: dr.sarah.johnson | Password: Doctor@123"
echo "   Username: dr.michael.chen  | Password: Doctor@123"
echo "   Username: dr.priya.patel   | Password: Doctor@123"
echo "   Username: dr.james.williams| Password: Doctor@123"
echo "   Username: dr.emily.martinez| Password: Doctor@123"
echo ""
