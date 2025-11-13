# Healthcare Portal API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication
Most endpoints require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "DOCTOR|NURSE|PATIENT|ADMIN"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "token": "jwt_token"
  }
}
```

### Get Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer TOKEN`

---

## 🏥 Patient Endpoints

### Create Patient Profile
**POST** `/patients`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "string",
  "phoneNumber": "string",
  "address": "string",
  "bloodGroup": "string",
  "allergies": "string",
  "emergencyContact": "string"
}
```

### Get All Patients
**GET** `/patients`

**Headers:** `Authorization: Bearer TOKEN` (DOCTOR or ADMIN only)

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name or phone

### Get Patient by ID
**GET** `/patients/:id`

**Headers:** `Authorization: Bearer TOKEN`

### Update Patient
**PUT** `/patients/:id`

**Headers:** `Authorization: Bearer TOKEN`

### Delete Patient
**DELETE** `/patients/:id`

**Headers:** `Authorization: Bearer TOKEN` (ADMIN only)

---

## 🩺 Doctor Endpoints

### Create Doctor Profile
**POST** `/doctors`

**Headers:** `Authorization: Bearer TOKEN` (ADMIN only)

**Body:**
```json
{
  "userId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "specialization": "string",
  "licenseNumber": "string",
  "phoneNumber": "string",
  "yearsExperience": number
}
```

### Get All Doctors
**GET** `/doctors`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `specialization` - Filter by specialization
- `search` - Search by name or specialization

### Get Doctor by ID
**GET** `/doctors/:id`

### Update Doctor
**PUT** `/doctors/:id`

**Headers:** `Authorization: Bearer TOKEN`

### Delete Doctor
**DELETE** `/doctors/:id`

**Headers:** `Authorization: Bearer TOKEN` (ADMIN only)

---

## 📅 Appointment Endpoints

### Create Appointment
**POST** `/appointments`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "dateTime": "ISO8601 datetime",
  "reason": "string",
  "notes": "string"
}
```

### Get All Appointments
**GET** `/appointments`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `status` - Filter by status (SCHEDULED|COMPLETED|CANCELLED)
- `patientId` - Filter by patient
- `doctorId` - Filter by doctor
- `date` - Filter by date (YYYY-MM-DD)

### Get Appointment by ID
**GET** `/appointments/:id`

**Headers:** `Authorization: Bearer TOKEN`

### Update Appointment
**PUT** `/appointments/:id`

**Headers:** `Authorization: Bearer TOKEN`

### Cancel Appointment
**PATCH** `/appointments/:id/cancel`

**Headers:** `Authorization: Bearer TOKEN`

### Delete Appointment
**DELETE** `/appointments/:id`

**Headers:** `Authorization: Bearer TOKEN` (ADMIN only)

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "string",
  "error": "string"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
}
```

---

## 🔒 Authorization Roles

- **PATIENT**: Can view own data, book appointments
- **DOCTOR**: Can view patients, appointments, update own profile
- **NURSE**: Can view patients, appointments
- **ADMIN**: Full access to all endpoints

---

## ⚠️ Common Errors

- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate entry (username, email, license)
- `500 Internal Server Error` - Server error

DATABASE_URL_OLD="postgresql://healthcare_admin:HealthCare2024!@localhost:5432/healthcare_portal?schema=public"
DATABASE_URL=postgresql://healthcare_admin:HealthCare2024%21@20.42.48.79:5432/healthcare_portal?schema=public