import React, { useState } from "react";
import { FiDownload, FiCalendar, FiUsers, FiActivity, FiTrendingUp, FiFileText, FiPieChart } from "react-icons/fi";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

export default function Reports() {
  const [reportType, setReportType] = useState("users");
  const [dateRange, setDateRange] = useState("month");
  const [startDate, setStartDate] = useState("2025-10-01");
  const [endDate, setEndDate] = useState("2025-11-11");

  // Sample Data
  const userGrowthData = [
    { month: "May", patients: 120, doctors: 15, admins: 3 },
    { month: "Jun", patients: 145, doctors: 18, admins: 3 },
    { month: "Jul", patients: 178, doctors: 22, admins: 4 },
    { month: "Aug", patients: 205, doctors: 25, admins: 4 },
    { month: "Sep", patients: 242, doctors: 28, admins: 5 },
    { month: "Oct", patients: 289, doctors: 32, admins: 5 }
  ];

  const appointmentData = [
    { day: "Mon", scheduled: 45, completed: 38, cancelled: 7 },
    { day: "Tue", scheduled: 52, completed: 46, cancelled: 6 },
    { day: "Wed", scheduled: 48, completed: 42, cancelled: 6 },
    { day: "Thu", scheduled: 61, completed: 55, cancelled: 6 },
    { day: "Fri", scheduled: 39, completed: 35, cancelled: 4 },
    { day: "Sat", scheduled: 28, completed: 25, cancelled: 3 },
    { day: "Sun", scheduled: 15, completed: 13, cancelled: 2 }
  ];

  const specialtyDistribution = [
    { name: "Cardiology", value: 35, color: "#3B82F6" },
    { name: "Dermatology", value: 25, color: "#10B981" },
    { name: "Pediatrics", value: 20, color: "#F59E0B" },
    { name: "Orthopedics", value: 15, color: "#EF4444" },
    { name: "Other", value: 5, color: "#8B5CF6" }
  ];

  const activityData = [
    { time: "00:00", logins: 12, appointments: 5 },
    { time: "04:00", logins: 8, appointments: 2 },
    { time: "08:00", logins: 45, appointments: 35 },
    { time: "12:00", logins: 78, appointments: 62 },
    { time: "16:00", logins: 92, appointments: 75 },
    { time: "20:00", logins: 34, appointments: 18 }
  ];

  const handleGenerateReport = () => {
    toast.success(`Generating ${reportType} report...`);
    setTimeout(() => {
      toast.success("Report generated successfully!");
    }, 1500);
  };

  const handleExportPDF = () => {
    toast.success("Exporting report as PDF...");
  };

  const handleExportCSV = () => {
    toast.success("Exporting report as CSV...");
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Generate comprehensive reports and analyze system data.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            <FiDownload /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiDownload /> PDF
          </button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="card-soft mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="users">User Analytics</option>
              <option value="appointments">Appointments</option>
              <option value="activity">System Activity</option>
              <option value="financial">Financial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
        >
          Generate Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <FiUsers />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,482</p>
              <p className="text-xs text-green-600">+12.5% from last month</p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-green">
              <FiCalendar />
            </div>
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">3,245</p>
              <p className="text-xs text-green-600">+8.3% from last month</p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-amber">
              <FiActivity />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">128</p>
              <p className="text-xs text-red-600">-2.1% from last hour</p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">245ms</p>
              <p className="text-xs text-green-600">-15% improvement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <div className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Growth Trend</h3>
            <FiTrendingUp className="text-sky-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patients" fill="#10B981" name="Patients" />
              <Bar dataKey="doctors" fill="#3B82F6" name="Doctors" />
              <Bar dataKey="admins" fill="#F59E0B" name="Admins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointments */}
        <div className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
            <FiCalendar className="text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="scheduled" stroke="#3B82F6" strokeWidth={2} name="Scheduled" />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Specialty Distribution */}
        <div className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Doctor Specialties</h3>
            <FiPieChart className="text-amber-600" />
          </div>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={specialtyDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {specialtyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {specialtyDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Activity Pattern</h3>
            <FiActivity className="text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#8B5CF6" strokeWidth={2} name="Logins" />
              <Line type="monotone" dataKey="appointments" stroke="#F59E0B" strokeWidth={2} name="Appointments" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="card-soft">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left">
            <FiFileText className="text-2xl text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Monthly Summary</h4>
            <p className="text-sm text-gray-600">Complete system overview</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left">
            <FiUsers className="text-2xl text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">User Report</h4>
            <p className="text-sm text-gray-600">User statistics & growth</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left">
            <FiCalendar className="text-2xl text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Appointment Report</h4>
            <p className="text-sm text-gray-600">Booking trends & patterns</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left">
            <FiActivity className="text-2xl text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">System Health</h4>
            <p className="text-sm text-gray-600">Performance metrics</p>
          </button>
        </div>
      </div>
    </div>
  );
}
