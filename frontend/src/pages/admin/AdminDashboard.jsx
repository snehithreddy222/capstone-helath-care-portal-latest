import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiCalendar, FiActivity } from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAppointments: 0,
    systemHealth: 98
  });

  const [userActivityData, setUserActivityData] = useState([]);
  const [userDistributionData, setUserDistributionData] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    setStats({
      totalUsers: 1248,
      activeUsers: 856,
      totalAppointments: 342,
      systemHealth: 98
    });

    setUserActivityData([
      { date: 'Mon', logins: 120, registrations: 12 },
      { date: 'Tue', logins: 150, registrations: 18 },
      { date: 'Wed', logins: 140, registrations: 15 },
      { date: 'Thu', logins: 180, registrations: 22 },
      { date: 'Fri', logins: 160, registrations: 19 },
      { date: 'Sat', logins: 90, registrations: 8 },
      { date: 'Sun', logins: 75, registrations: 6 }
    ]);

    setUserDistributionData([
      { name: 'Patients', value: 856, color: '#3b82f6' },
      { name: 'Doctors', value: 324, color: '#10b981' },
      { name: 'Admins', value: 68, color: '#f59e0b' }
    ]);

    setRecentRegistrations([
      { id: 1, name: 'John Smith', email: 'john@example.com', role: 'PATIENT', date: '2024-01-12 10:30' },
      { id: 2, name: 'Dr. Sarah Johnson', email: 'sarah@example.com', role: 'DOCTOR', date: '2024-01-12 09:15' },
      { id: 3, name: 'Emily Davis', email: 'emily@example.com', role: 'PATIENT', date: '2024-01-12 08:45' },
      { id: 4, name: 'Dr. Michael Brown', email: 'michael@example.com', role: 'DOCTOR', date: '2024-01-11 16:20' },
      { id: 5, name: 'Jessica Wilson', email: 'jessica@example.com', role: 'PATIENT', date: '2024-01-11 14:10' }
    ]);

    setSystemAlerts([
      { id: 1, type: 'warning', message: 'Database backup scheduled for tonight at 2:00 AM', time: '2 hours ago' },
      { id: 2, type: 'info', message: 'System maintenance completed successfully', time: '5 hours ago' },
      { id: 3, type: 'success', message: 'All services are running normally', time: '1 day ago' }
    ]);
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-orange-100 text-orange-800';
      case 'DOCTOR': return 'bg-green-100 text-green-800';
      case 'PATIENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system activity and user metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiUserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.systemHealth}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FiActivity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Registrations</h2>
          <div className="space-y-4">
            {recentRegistrations.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{user.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs mt-1 opacity-75">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
