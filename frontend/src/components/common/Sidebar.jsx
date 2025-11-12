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
  FiActivity,
} from "react-icons/fi";
import { authService } from "../../services/authService";

const Item = ({ to, icon, label }) => {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
    >
      {Icon && <Icon className="text-[18px] shrink-0" />}
      <span className="text-[15px] font-medium">{label}</span>
    </NavLink>
  );
};

export default function Sidebar({ role = "PATIENT" }) {
  const navigate = useNavigate();
  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  const patientNav = [
    { to: "/patient/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/patient/appointments", icon: FiCalendar, label: "Appointments" },
    { to: "/patient/messages", icon: FiMessageSquare, label: "Messages" },
    { to: "/patient/test-results", icon: FiDroplet, label: "Test Results" },
    { to: "/patient/medications", icon: FiHeart, label: "Medications" },
    { to: "/patient/billings", icon: FiCreditCard, label: "Billings" },
  ];

  const doctorNav = [
    { to: "/doctor/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/doctor/appointments", icon: FiCalendar, label: "Appointments" },
    { to: "/doctor/patients", icon: FiUsers, label: "Patients" },
    { to: "/doctor/schedule", icon: FiActivity, label: "Schedule" },
    { to: "/doctor/medical-records", icon: FiFileText, label: "Medical Records" },
    { to: "/doctor/prescriptions", icon: FiHeart, label: "Prescriptions" },
    { to: "/doctor/messages", icon: FiMessageSquare, label: "Messages" },
  ];

  const navItems = role === "DOCTOR" ? doctorNav : patientNav;
  const settingsPath = role === "DOCTOR" ? "/doctor/settings" : "/patient/settings";

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
        {navItems.map((item) => (
          <Item key={item.to} to={item.to} icon={item.icon} label={item.label} />
        ))}
      </nav>

      {/* Spacer to push footer items down */}
      <div className="flex-1" />

      {/* Footer actions: Account Settings above Logout */}
      <div className="px-3 pb-4">
        <NavLink
          to={settingsPath}
          className={({ isActive }) =>
            `nav-item ${isActive ? "nav-item-active" : ""}`
          }
        >
          <FiSettings className="text-[18px] shrink-0" />
          <span className="text-[15px] font-medium">Settings</span>
        </NavLink>

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
