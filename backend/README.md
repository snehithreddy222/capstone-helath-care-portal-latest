# Healthcare Portal - Backend API

## Overview
RESTful API for Healthcare Portal Patient Management System

## Tech Stack
- **Runtime:** Node.js v20
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@localhost:5432/healthcare_portal?schema=public"
PORT=3000
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev
```

### 4. Start Server
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

## Project Structure
```
backend/
├── controllers/       # Request handlers
├── routes/           # API routes
├── middleware/       # Custom middleware
├── utils/            # Helper functions
├── prisma/           # Database schema
├── server.js         # Main entry point
└── .env             # Environment variables
```

## Database Schema
- **users** - Authentication
- **patients** - Patient records
- **doctors** - Doctor profiles
- **appointments** - Scheduling
- **medical_records** - Diagnoses & treatments
- **prescriptions** - Medications

## Testing
Use Postman, Thunder Client, or curl to test endpoints.

## License
MIT - Educational Project
```

4. **Save:** `Ctrl + S`

---

## ✅ YOUR FINAL PROJECT STRUCTURE:
```
backend/
├── controllers/
│   └── authController.js
├── middleware/
│   └── auth.js
├── routes/
│   └── authRoutes.js
├── utils/
│   ├── jwt.js
│   └── password.js
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## 🎯 NEXT: UPDATE DATABASE CONNECTION

Your `.env` file has the VM2 database connection. Since you're testing locally now, we need to decide:

**Option A:** Keep connecting to VM2 database (need VM2 running)  
**Option B:** Install PostgreSQL locally (work completely offline)

For now, **let's keep Option A** (connect to VM2 database).

---

## 🚀 TEST THE SERVER LOCALLY!

### **Step 1: Make Sure VM2 is Running**

Check Azure Portal - VM2 should be running.

### **Step 2: Update .env for Remote Database**

Your `.env` should have:
```
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal?schema=public"
```

**⚠️ IMPORTANT:** Change `localhost` to VM2's public IP!

Open `.env` file and update the line:

**Replace:**
```
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@localhost:5432/healthcare_portal?schema=public"
```

**With:**
```
DATABASE_URL="postgresql://healthcare_admin:HealthCare2024!@20.42.48.79:5432/healthcare_portal?schema=public"