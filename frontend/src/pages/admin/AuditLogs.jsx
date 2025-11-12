import React, { useState } from "react";
import { FiSearch, FiFilter, FiDownload, FiActivity, FiUser, FiSettings, FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");

  const logs = [
    {
      id: 1,
      timestamp: "2025-11-11 10:45:23",
      user: "admin_user",
      action: "USER_CREATED",
      resource: "User: john_doe",
      ipAddress: "192.168.1.100",
      status: "success",
      details: "Created new patient account"
    },
    {
      id: 2,
      timestamp: "2025-11-11 10:30:15",
      user: "dr_smith",
      action: "RECORD_UPDATED",
      resource: "Medical Record #1234",
      ipAddress: "192.168.1.101",
      status: "success",
      details: "Updated patient diagnosis"
    },
    {
      id: 3,
      timestamp: "2025-11-11 10:15:42",
      user: "john_doe",
      action: "LOGIN_SUCCESS",
      resource: "Authentication",
      ipAddress: "192.168.1.102",
      status: "success",
      details: "User logged in successfully"
    },
    {
      id: 4,
      timestamp: "2025-11-11 09:58:30",
      user: "unknown",
      action: "LOGIN_FAILED",
      resource: "Authentication",
      ipAddress: "192.168.1.103",
      status: "failure",
      details: "Invalid credentials"
    },
    {
      id: 5,
      timestamp: "2025-11-11 09:45:18",
      user: "admin_user",
      action: "SETTINGS_CHANGED",
      resource: "System Settings",
      ipAddress: "192.168.1.100",
      status: "success",
      details: "Updated security policy"
    },
    {
      id: 6,
      timestamp: "2025-11-11 09:30:05",
      user: "dr_wilson",
      action: "PRESCRIPTION_CREATED",
      resource: "Prescription #5678",
      ipAddress: "192.168.1.104",
      status: "success",
      details: "Created new prescription"
    },
    {
      id: 7,
      timestamp: "2025-11-11 09:15:22",
      user: "jane_patient",
      action: "APPOINTMENT_CANCELLED",
      resource: "Appointment #9012",
      ipAddress: "192.168.1.105",
      status: "success",
      details: "Cancelled upcoming appointment"
    },
    {
      id: 8,
      timestamp: "2025-11-11 09:00:10",
      user: "admin_user",
      action: "USER_DELETED",
      resource: "User: test_user",
      ipAddress: "192.168.1.100",
      status: "success",
      details: "Removed inactive user account"
    }
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);
    const matchesUser = userFilter === "all" || log.user === userFilter;
    return matchesSearch && matchesAction && matchesUser;
  });

  const getActionIcon = (action) => {
    if (action.includes("LOGIN")) return FiUser;
    if (action.includes("SETTINGS")) return FiSettings;
    if (action.includes("FAILED") || action.includes("DELETED")) return FiAlertTriangle;
    return FiActivity;
  };

  const getActionBadge = (action) => {
    if (action.includes("CREATED") || action.includes("SUCCESS")) return "pill-green";
    if (action.includes("UPDATED") || action.includes("CHANGED")) return "pill-blue";
    if (action.includes("DELETED") || action.includes("CANCELLED")) return "pill-amber";
    if (action.includes("FAILED")) return "pill-red";
    return "pill-gray";
  };

  const getStatusIcon = (status) => {
    return status === "success" ? FiCheckCircle : FiXCircle;
  };

  const handleExportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Resource", "IP Address", "Status", "Details"],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.resource,
        log.ipAddress,
        log.status,
        log.details
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Audit Logs
          </h1>
          <p className="mt-2 text-gray-600">
            Track all system activities and user actions.
          </p>
        </div>
        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
        >
          <FiDownload /> Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-soft">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="card-soft">
          <p className="text-sm text-gray-600">Successful</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.status === "success").length}
          </p>
        </div>
        <div className="card-soft">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {logs.filter(l => l.status === "failure").length}
          </p>
        </div>
        <div className="card-soft">
          <p className="text-sm text-gray-600">Unique Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(logs.map(l => l.user)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-soft mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATED">Created</option>
              <option value="UPDATED">Updated</option>
              <option value="DELETED">Deleted</option>
              <option value="SETTINGS">Settings</option>
            </select>
          </div>

          {/* User Filter */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Users</option>
            {[...new Set(logs.map(l => l.user))].map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map(log => {
          const ActionIcon = getActionIcon(log.action);
          const StatusIcon = getStatusIcon(log.status);
          
          return (
            <div key={log.id} className="card-soft hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`tile ${log.status === "success" ? "tile-green" : "tile-red"}`}>
                  <ActionIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={getActionBadge(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </div>
                    <StatusIcon className={log.status === "success" ? "text-green-600" : "text-red-600"} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">User:</span>{" "}
                      <span className="font-medium text-gray-900">{log.user}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Resource:</span>{" "}
                      <span className="font-medium text-gray-900">{log.resource}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">IP:</span>{" "}
                      <span className="font-medium text-gray-900">{log.ipAddress}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{log.details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLogs.length === 0 && (
        <div className="card-soft text-center py-12">
          <FiActivity className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">No audit logs found.</p>
        </div>
      )}
    </div>
  );
}
