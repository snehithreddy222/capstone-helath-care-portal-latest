import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiCalendar,
  FiMessageSquare,
  FiDroplet,
  FiHeart,
  FiCreditCard,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiFileText,
} from "react-icons/fi";
import { authService } from "../../services/authService";

const Item = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
  >
    <Icon className="text-[18px] shrink-0" />
    <span className="text-[15px] font-medium">{label}</span>
  </NavLink>
);

export default function Sidebar({ role = "PATIENT" }) {
  const navigate = useNavigate();
  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <aside className="shell-sidebar">
      {/* Brand */}
      <div className="sb-head">
        <div className="w-8 h-8 rounded-lg bg-sky-600 grid place-items-center mr-3">
          <div className="w-3 h-3 rounded-sm bg-white" />
        </div>
        <span className="text-[18px] font-semibold">HealthApp</span>
      </div>

      {/* Main nav */}
      <nav className="mt-2">
        {role === "PATIENT" ? (
          <>
            <Item to="/patient/dashboard" icon={FiGrid} label="Dashboard" />
            <Item to="/patient/appointments" icon={FiCalendar} label="Appointments" />
            <Item to="/patient/messages" icon={FiMessageSquare} label="Messages" />
            <Item to="/patient/test-results" icon={FiDroplet} label="Test Results" />
            <Item to="/patient/medications" icon={FiHeart} label="Medications" />
            <Item to="/patient/billings" icon={FiCreditCard} label="Billings" />
          </>
        ) : role === "DOCTOR" ? (
          <>
            <Item to="/doctor/dashboard" icon={FiGrid} label="Dashboard" />
            <Item to="/doctor/appointments" icon={FiCalendar} label="Appointments" />
            <Item to="/doctor/patients" icon={FiUsers} label="Patients" />
            <Item to="/doctor/medical-records" icon={FiFileText} label="Medical Records" />
            <Item to="/doctor/prescriptions" icon={FiHeart} label="Prescriptions" />
          </>
        ) : role === "ADMIN" ? (
          <>
            <Item to="/admin/dashboard" icon={FiGrid} label="Dashboard" />
            <Item to="/admin/users" icon={FiUsers} label="User Management" />
            <Item to="/admin/audit-logs" icon={FiFileText} label="Audit Logs" />
            <Item to="/admin/reports" icon={FiCalendar} label="Reports" />
            <Item to="/admin/settings" icon={FiSettings} label="System Settings" />
          </>
        ) : null}
      </nav>

      {/* Spacer to push footer items down */}
      <div className="flex-1" />

      {/* Footer actions: Account Settings above Logout */}
      <div className="px-3 pb-4">
        {role !== "ADMIN" && (
          <NavLink
            to={role === "DOCTOR" ? "/doctor/settings" : "/patient/settings"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "nav-item-active" : ""}`
            }
          >
            <FiSettings className="text-[18px] shrink-0" />
            <span className="text-[15px] font-medium">Account Settings</span>
          </NavLink>
        )}

        <button
          onClick={logout}
          className="mt-2 w-full inline-flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
        >
          <FiLogOut className="text-[18px]" /> Logout
        </button>
      </div>
    </aside>
  );
}
