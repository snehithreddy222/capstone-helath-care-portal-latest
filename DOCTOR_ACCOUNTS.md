# 👨‍⚕️ Doctor Accounts Reference Card

## Quick Access Information

### 🔐 Login Credentials (All use same password)
**Password for all doctors:** `Doctor@123`

---

## 📋 Doctor Directory

### 1️⃣ Dr. Sarah Johnson - Cardiology
- **Username:** `dr.sarah.johnson`
- **Email:** `sarah.johnson@hospital.com`
- **Phone:** +1-555-0101
- **License:** MD-CARD-2024-001
- **Experience:** 12 years
- **Specialization:** Heart and cardiovascular system
- **Best for:** Heart conditions, blood pressure, chest pain

---

### 2️⃣ Dr. Michael Chen - Orthopedics
- **Username:** `dr.michael.chen`
- **Email:** `michael.chen@hospital.com`
- **Phone:** +1-555-0102
- **License:** MD-ORTH-2024-002
- **Experience:** 15 years
- **Specialization:** Bones, joints, and muscles
- **Best for:** Fractures, joint pain, sports injuries

---

### 3️⃣ Dr. Priya Patel - Pediatrics
- **Username:** `dr.priya.patel`
- **Email:** `priya.patel@hospital.com`
- **Phone:** +1-555-0103
- **License:** MD-PEDI-2024-003
- **Experience:** 8 years
- **Specialization:** Children's health and development
- **Best for:** Child checkups, vaccinations, child illnesses

---

### 4️⃣ Dr. James Williams - Neurology
- **Username:** `dr.james.williams`
- **Email:** `james.williams@hospital.com`
- **Phone:** +1-555-0104
- **License:** MD-NEUR-2024-004
- **Experience:** 20 years
- **Specialization:** Brain and nervous system
- **Best for:** Headaches, seizures, nerve problems

---

### 5️⃣ Dr. Emily Martinez - Dermatology
- **Username:** `dr.emily.martinez`
- **Email:** `emily.martinez@hospital.com`
- **Phone:** +1-555-0105
- **License:** MD-DERM-2024-005
- **Experience:** 10 years
- **Specialization:** Skin, hair, and nails
- **Best for:** Skin conditions, rashes, acne

---

## 🚀 Quick Commands

### View all doctors in database:
```bash
curl http://localhost:3000/api/doctors
```

### View in Prisma Studio:
```bash
cd backend
npx prisma studio
```

### Re-seed if needed:
```bash
cd backend
npm run seed
```

---

## 📱 Patient Booking

When patients book appointments, they will see:
```
[Dropdown Menu]
Dr. Sarah Johnson - Cardiology
Dr. Michael Chen - Orthopedics
Dr. Priya Patel - Pediatrics
Dr. James Williams - Neurology
Dr. Emily Martinez - Dermatology
```

---

## 🧪 Testing Scenarios

### Test 1: Doctor Login
1. Go to login page
2. Use: `dr.sarah.johnson` / `Doctor@123`
3. Should redirect to doctor dashboard

### Test 2: Patient Books Appointment
1. Login as patient
2. Go to Schedule Appointment
3. Select doctor from dropdown
4. All 5 doctors should appear

### Test 3: View Doctor's Appointments
1. Login as doctor
2. Go to Appointments page
3. Should see their scheduled appointments

---

## 💾 Database Schema

```sql
-- Users table (authentication)
id, username, email, password (hashed), role: "DOCTOR"

-- Doctors table (profile)
id, userId, firstName, lastName, specialization, 
licenseNumber, phoneNumber, yearsExperience
```

---

## 🔄 Reset Doctors

To delete and recreate all doctors:
```bash
cd backend
npx prisma migrate reset
# This will run seed automatically
```

---

**Print this card and keep handy for testing! 📄**
