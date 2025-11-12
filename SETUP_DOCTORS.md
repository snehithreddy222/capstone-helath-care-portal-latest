# 🚀 Quick Setup Guide - Adding Doctors to Database

## Prerequisites

Before running the seed script, you need to:

1. ✅ Have PostgreSQL installed and running
2. ✅ Create a database for the healthcare portal
3. ✅ Configure the `.env` file with database credentials

---

## Step 1: Create Database

Connect to PostgreSQL and create a database:

```bash
# Option 1: Using psql command line
psql -U postgres
CREATE DATABASE healthcare_portal;
\q

# Option 2: Using pgAdmin or any PostgreSQL GUI
```

---

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update with your database credentials:

```env
# Example for local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/healthcare_portal"

# Other configuration
PORT=3000
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRY="24h"
NODE_ENV="development"
```

### Database URL Format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Examples:**
- Local: `postgresql://postgres:admin123@localhost:5432/healthcare_portal`
- Docker: `postgresql://postgres:postgres@db:5432/healthcare_portal`
- Remote: `postgresql://user:pass@your-server.com:5432/healthcare_portal`

---

## Step 3: Run Database Migrations

Generate Prisma Client and run migrations:

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

This will create all necessary tables: `users`, `patients`, `doctors`, `appointments`, `medical_records`, `prescriptions`.

---

## Step 4: Run the Seed Script

Now you can seed the database with 5 sample doctors:

```bash
# Option 1: Using npm script
npm run seed

# Option 2: Direct execution
node prisma/seed.js
```

### Expected Output:

```
🌱 Starting database seed...
✅ Created Dr. Sarah Johnson - Cardiology
✅ Created Dr. Michael Chen - Orthopedics
✅ Created Dr. Priya Patel - Pediatrics
✅ Created Dr. James Williams - Neurology
✅ Created Dr. Emily Martinez - Dermatology

📊 Seed Summary:
   Total Doctors: 5
   Total Users: 5

✨ Database seed completed!
```

---

## Step 5: Verify Doctors Were Created

### Option 1: Using Prisma Studio
```bash
npx prisma studio
```
Navigate to `http://localhost:5555` and check the `doctors` and `users` tables.

### Option 2: Using API
Start the server and test the doctors endpoint:

```bash
# Start the server
node server.js

# In another terminal, test the API
curl http://localhost:3000/api/doctors
```

---

## 👨‍⚕️ Created Doctors

| Name | Specialization | Username | Email | Password |
|------|----------------|----------|-------|----------|
| Dr. Sarah Johnson | Cardiology | dr.sarah.johnson | sarah.johnson@hospital.com | Doctor@123 |
| Dr. Michael Chen | Orthopedics | dr.michael.chen | michael.chen@hospital.com | Doctor@123 |
| Dr. Priya Patel | Pediatrics | dr.priya.patel | priya.patel@hospital.com | Doctor@123 |
| Dr. James Williams | Neurology | dr.james.williams | james.williams@hospital.com | Doctor@123 |
| Dr. Emily Martinez | Dermatology | dr.emily.martinez | emily.martinez@hospital.com | Doctor@123 |

---

## 🏥 Patient Booking Integration

Once doctors are seeded, patients can see them in the appointment booking form:

1. Go to patient dashboard
2. Click "Schedule Appointment"
3. Select a doctor from the dropdown
4. All 5 doctors will be available with their specializations

---

## 🔧 Troubleshooting

### Error: DATABASE_URL not found
**Solution:** Create `.env` file with DATABASE_URL

```bash
cd backend
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/healthcare_portal"' > .env
```

### Error: Can't connect to database
**Solutions:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Create database if it doesn't exist
4. Check firewall/port settings

### Error: Prisma Client not generated
**Solution:**
```bash
npx prisma generate
```

### Error: Tables don't exist
**Solution:**
```bash
npx prisma migrate dev --name init
```

### Doctors already exist
**Result:** Script will skip existing doctors and show:
```
⚠️  Doctor Sarah Johnson already exists, skipping...
```

---

## 🔄 Reset Everything (Fresh Start)

If you want to start completely fresh:

```bash
# This will drop database, recreate tables, and run seed
npx prisma migrate reset

# When prompted, type 'y' to confirm
```

⚠️ **Warning:** This deletes all data!

---

## 📝 Adding More Doctors

Edit `backend/prisma/seed.js` and add to the `doctors` array:

```javascript
{
  user: {
    username: 'dr.new.doctor',
    email: 'new.doctor@hospital.com',
    password: hashedPassword,
    role: 'DOCTOR',
  },
  doctor: {
    firstName: 'New',
    lastName: 'Doctor',
    specialization: 'General Medicine',
    licenseNumber: 'MD-GEN-2024-006',
    phoneNumber: '+1-555-0106',
    yearsExperience: 5,
  },
}
```

Then run the seed script again.

---

## ✅ Next Steps

After seeding:

1. **Start the backend server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test doctor login:**
   - Login as: `dr.sarah.johnson` / `Doctor@123`

4. **Test patient booking:**
   - Create/login as patient
   - Go to Schedule Appointment
   - Select a doctor from dropdown

---

## 📞 Need Help?

Common issues:
- Database connection: Check `.env` file
- Prisma errors: Run `npx prisma generate`
- Migration errors: Run `npx prisma migrate dev`
- Port conflicts: Change PORT in `.env`

---

**Setup Complete! 🎉**

Your healthcare portal now has 5 doctors ready for patient appointments!
