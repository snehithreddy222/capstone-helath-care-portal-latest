// src/pages/doctor/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUsers,
  FiActivity,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import http from "../../services/http";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalPatients: 0,
    completedToday: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await loadDashboardData();
    };
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true); // Silent refresh
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      // Get doctor's ID from user context or fetch doctor profile
      let doctorId = user?.doctorId;
      
      // If doctorId not in user object, fetch it
      if (!doctorId && user?.userId) {
        try {
          const { data: doctorRes } = await http.get(`/doctors?userId=${user.userId}`);
          doctorId = doctorRes?.data?.[0]?.id;
        } catch (err) {
          console.error("Error fetching doctor profile:", err);
        }
      }

      // Fetch all appointments for this doctor
      const { data: appointmentsRes } = await http.get("/appointments", {
        params: doctorId ? { doctorId } : {},
      });
      
      const appointments = appointmentsRes?.data?.appointments || appointmentsRes?.data || [];

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Filter today's appointments
      const todayAppts = appointments.filter((a) => {
        const apptDate = new Date(a.dateTime);
        return apptDate >= today && apptDate < tomorrow;
      });

      // Filter scheduled appointments for today
      const todayScheduled = todayAppts.filter(a => a.status === "SCHEDULED");

      // Filter upcoming appointments (future + scheduled)
      const upcomingAppts = appointments.filter((a) => {
        const apptDate = new Date(a.dateTime);
        return apptDate >= now && a.status === "SCHEDULED";
      });

      // Completed today
      const completedToday = todayAppts.filter(a => a.status === "COMPLETED").length;

      // Calculate unique patients
      const uniquePatientIds = new Set(appointments.map((a) => a.patientId));

      setStats({
        todayAppointments: todayScheduled.length,
        upcomingAppointments: upcomingAppts.length,
        totalPatients: uniquePatientIds.size,
        completedToday: completedToday,
      });

      // Prepare today's schedule (sorted by time)
      const scheduleData = todayAppts
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          time: new Date(a.dateTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          patientName: a.patient
            ? `${a.patient.firstName} ${a.patient.lastName}`
            : "Unknown Patient",
          patientPhone: a.patient?.phoneNumber || "",
          reason: a.reason || "General Consultation",
          status: a.status,
          notes: a.notes,
        }));

      setTodaySchedule(scheduleData);

      // Get recent unique patients (from most recent appointments)
      const patientMap = new Map();
      appointments
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        .forEach((appt) => {
          if (appt.patient && !patientMap.has(appt.patientId)) {
            patientMap.set(appt.patientId, {
              id: appt.patientId,
              name: `${appt.patient.firstName} ${appt.patient.lastName}`,
              lastVisit: new Date(appt.dateTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              condition: appt.reason || "General Consultation",
              phone: appt.patient.phoneNumber,
              status: appt.status,
            });
          }
        });

      setRecentPatients(Array.from(patientMap.values()).slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Welcome Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl sm:text-[32px] font-extrabold tracking-tight text-gray-900">
            Welcome back, Dr. {user?.username || "Doctor"}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your overview for today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => loadDashboardData()}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
            refreshing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FiRefreshCw className={`text-lg ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
        <div className="card-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Today's Appointments
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.todayAppointments}
              </p>
            </div>
            <div className="tile tile-blue">
              <FiCalendar className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <FiTrendingUp className="text-green-600 mr-1" />
            <span className="text-green-600 font-medium">
              {stats.upcomingAppointments} upcoming
            </span>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.totalPatients}
              </p>
            </div>
            <div className="tile tile-blue">
              <FiUsers className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/doctor/patients"
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              View all patients →
            </Link>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Completed Today
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : stats.completedToday}
              </p>
            </div>
            <div className="tile tile-blue bg-green-50 text-green-700 border-green-200">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/doctor/appointments"
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              View appointments →
            </Link>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Response Time
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? "..." : "< 2h"}
              </p>
            </div>
            <div className="tile tile-blue">
              <FiClock className="text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/doctor/messages"
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              Check messages →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Today's Schedule */}
        <div className="xl:col-span-2 card-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="tile tile-blue">
                <FiActivity />
              </div>
              <h2 className="text-lg font-semibold">Today's Schedule</h2>
            </div>
            <Link
              to="/doctor/appointments"
              className="text-sm font-medium text-sky-700 hover:underline"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : todaySchedule.length === 0 ? (
            <div className="py-8 text-center">
              <FiCheckCircle className="mx-auto text-4xl text-green-500 mb-3" />
              <p className="text-gray-600">No appointments scheduled for today</p>
              <p className="text-sm text-gray-500 mt-1">Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((appt) => (
                <div
                  key={appt.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    appt.status === "COMPLETED"
                      ? "border-green-200 bg-green-50"
                      : appt.status === "CANCELLED"
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-sky-200 bg-sky-50 hover:bg-sky-100"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px]">
                      <div className={`text-sm font-bold ${
                        appt.status === "COMPLETED" ? "text-green-700" :
                        appt.status === "CANCELLED" ? "text-gray-500" :
                        "text-sky-700"
                      }`}>
                        {appt.time}
                      </div>
                    </div>
                    <div className="h-10 w-px bg-gray-300" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {appt.patientName || "Unknown Patient"}
                        </p>
                        {appt.status === "COMPLETED" && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            ✓ Done
                          </span>
                        )}
                        {appt.status === "CANCELLED" && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{appt.reason}</p>
                      {appt.patientPhone && (
                        <p className="text-xs text-gray-500 mt-1">📞 {appt.patientPhone}</p>
                      )}
                      {appt.notes && (
                        <p className="text-xs text-amber-700 mt-1 italic">Note: {appt.notes}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/doctor/appointments`}
                    className="ml-2 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-white rounded-lg transition-colors"
                  >
                    Details →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card-soft">
          <div className="flex items-center gap-2 mb-6">
            <div className="tile tile-blue">
              <FiUsers />
            </div>
            <h2 className="text-lg font-semibold">Recent Patients</h2>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : recentPatients.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No recent patients
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <Link
                  key={patient.id}
                  to="/doctor/patients"
                  className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-sky-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {patient.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        📅 Last visit: {patient.lastVisit}
                      </p>
                      {patient.phone && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          📞 {patient.phone}
                        </p>
                      )}
                    </div>
                    {patient.status && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        patient.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        patient.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {patient.status}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-full">
                      {patient.condition}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/doctor/patients"
            className="mt-4 inline-block text-sm font-medium text-sky-700 hover:underline"
          >
            View All Patients →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Link
          to="/doctor/prescriptions"
          className="card-soft hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <span className="text-xl">💊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Write Prescription
              </h3>
              <p className="text-sm text-gray-600">Create new prescription</p>
            </div>
          </div>
        </Link>

        <Link
          to="/doctor/medical-records"
          className="card-soft hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Medical Records</h3>
              <p className="text-sm text-gray-600">View & update records</p>
            </div>
          </div>
        </Link>

        <Link
          to="/doctor/messages"
          className="card-soft hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-600">Communication center</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
