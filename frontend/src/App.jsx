// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layout
import Sidebar from "./components/common/Sidebar";
import Topbar from "./components/common/Topbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientMessages from "./pages/patient/PatientMessages";
import TestResults from "./pages/patient/TestResults";
import Medications from "./pages/patient/Medications";
import Billings from "./pages/patient/Billings";
import ScheduleAppointment from "./pages/patient/ScheduleAppointment";
import AccountSettings from "./pages/patient/AccountSettings";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorMedicalRecords from "./pages/doctor/DoctorMedicalRecords";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorSettings from "./pages/doctor/DoctorSettings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";

function PatientLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (persistent) */}
      <aside className="w-[244px] bg-white border-r border-gray-200 sticky top-0 h-screen">
        <Sidebar role="PATIENT" />
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="main-inner">{children}</main>
      </div>
    </div>
  );
}

function DoctorLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (persistent) */}
      <aside className="w-[244px] bg-white border-r border-gray-200 sticky top-0 h-screen">
        <Sidebar role="DOCTOR" />
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="main-inner">{children}</main>
      </div>
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar (persistent) */}
      <aside className="w-[244px] bg-white border-r border-gray-200 sticky top-0 h-screen">
        <Sidebar role="ADMIN" />
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="main-inner">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient routes (protected) */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <PatientDashboard />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <PatientAppointments />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          {/* NEW: schedule form */}
          <Route
            path="/patient/appointments/new"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <ScheduleAppointment />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/messages"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <PatientMessages />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/test-results"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <TestResults />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medications"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <Medications />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/billings"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <Billings />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute allowedRoles={["PATIENT"]}>
                <PatientLayout>
                  <AccountSettings />
                </PatientLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor routes (protected) */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorDashboard />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorAppointments />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorPatients />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/medical-records"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorMedicalRecords />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorPrescriptions />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={["DOCTOR"]}>
                <DoctorLayout>
                  <DoctorSettings />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin routes (protected) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <UserManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <AuditLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <Reports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout>
                  <SystemSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
