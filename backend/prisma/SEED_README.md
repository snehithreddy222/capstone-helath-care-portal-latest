# Database Seeding - Doctor Accounts

This directory contains the seed script to populate the database with sample doctor accounts.

## 📋 Doctors Created

The seed script creates **5 doctors** with different specializations:

| Name | Specialization | License Number | Phone | Years of Experience |
|------|----------------|----------------|-------|---------------------|
| Dr. Sarah Johnson | Cardiology | MD-CARD-2024-001 | +1-555-0101 | 12 years |
| Dr. Michael Chen | Orthopedics | MD-ORTH-2024-002 | +1-555-0102 | 15 years |
| Dr. Priya Patel | Pediatrics | MD-PEDI-2024-003 | +1-555-0103 | 8 years |
| Dr. James Williams | Neurology | MD-NEUR-2024-004 | +1-555-0104 | 20 years |
| Dr. Emily Martinez | Dermatology | MD-DERM-2024-005 | +1-555-0105 | 10 years |

## 🔐 Default Credentials

All doctor accounts use the same default password for testing:
- **Password:** `Doctor@123`

### Login Examples:
- Username: `dr.sarah.johnson` | Email: `sarah.johnson@hospital.com`
- Username: `dr.michael.chen` | Email: `michael.chen@hospital.com`
- Username: `dr.priya.patel` | Email: `priya.patel@hospital.com`
- Username: `dr.james.williams` | Email: `james.williams@hospital.com`
- Username: `dr.emily.martinez` | Email: `emily.martinez@hospital.com`

## 🚀 How to Run the Seed Script

### Option 1: Using npm script
```bash
cd backend
npm run seed
```

### Option 2: Using Prisma CLI
```bash
cd backend
npx prisma db seed
```

### Option 3: Direct execution
```bash
cd backend
node prisma/seed.js
```

## 📝 What the Seed Script Does

1. **Creates User accounts** for each doctor with:
   - Unique username and email
   - Hashed password (bcrypt)
   - Role set to 'DOCTOR'

2. **Creates Doctor profiles** with:
   - Personal information (first name, last name)
   - Specialization
   - Unique license number
   - Contact information
   - Years of experience

3. **Skips existing doctors** - If a doctor with the same email already exists, it will be skipped

4. **Provides feedback** - Shows success/error messages for each doctor created

## ✅ Expected Output

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

## 🔍 Verification

After running the seed script, you can verify the doctors were created:

### Using Prisma Studio:
```bash
cd backend
npx prisma studio
```

### Using API endpoint:
```bash
# Get all doctors
curl http://localhost:3000/api/doctors

# Get paginated doctors
curl http://localhost:3000/api/doctors/paginated
```

## 🏥 Patient Booking Integration

These doctors will now appear in the patient's **Schedule Appointment** page when booking appointments. The doctor selection dropdown will show:

```
Dr. Sarah Johnson - Cardiology
Dr. Michael Chen - Orthopedics
Dr. Priya Patel - Pediatrics
Dr. James Williams - Neurology
Dr. Emily Martinez - Dermatology
```

## 🛠️ Customization

To add more doctors or modify existing ones, edit the `doctors` array in `seed.js`:

```javascript
const doctors = [
  {
    user: {
      username: 'dr.username',
      email: 'email@hospital.com',
      password: hashedPassword,
      role: 'DOCTOR',
    },
    doctor: {
      firstName: 'FirstName',
      lastName: 'LastName',
      specialization: 'Specialization',
      licenseNumber: 'UNIQUE-LICENSE-NUMBER',
      phoneNumber: '+1-555-XXXX',
      yearsExperience: 10,
    },
  },
  // Add more doctors...
];
```

## ⚠️ Important Notes

1. **Run after migration** - Make sure to run database migrations before seeding:
   ```bash
   npx prisma migrate dev
   ```

2. **Duplicate prevention** - The script checks for existing emails and skips duplicates

3. **Password security** - Default password is for testing only. Change in production!

4. **Database connection** - Ensure your `.env` file has the correct `DATABASE_URL`

## 🔄 Reset Database (Optional)

If you want to reset the database and re-seed:

```bash
cd backend
npx prisma migrate reset
# This will drop the database, run migrations, and automatically run the seed script
```

## 📞 Support

If you encounter any issues:
1. Check database connection in `.env`
2. Ensure Prisma Client is generated: `npx prisma generate`
3. Check for error messages in the console output

---

**Last Updated:** November 12, 2025
**Status:** ✅ Ready to Use
