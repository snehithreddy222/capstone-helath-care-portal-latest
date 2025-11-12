// src/layouts/DoctorLayout.jsx
import React from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";

export default function DoctorLayout({ children }) {
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
