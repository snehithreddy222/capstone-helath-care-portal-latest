// src/pages/doctor/DoctorAppointments.jsx
import React, { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiUser, FiCheck, FiX, FiSearch, FiRefreshCw } from "react-icons/fi";
import DateBadge from "../../components/common/DateBadge";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("upcoming"); // upcoming, today, past, all
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await loadAppointments();
    };
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAppointments(true); // Silent refresh
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Filter appointments based on current filter and search query
    let filtered = [...appointments];

    // Apply status filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filter === "upcoming") {
      filtered = filtered.filter(
        (a) => new Date(a.dateTime) >= now && a.status === "SCHEDULED"
      );
    } else if (filter === "today") {
      filtered = filtered.filter((a) => {
        const apptDate = new Date(a.dateTime);
        return apptDate >= today && apptDate < tomorrow;
      });
    } else if (filter === "past") {
      filtered = filtered.filter(
        (a) => new Date(a.dateTime) < now || a.status === "COMPLETED"
      );
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((a) => {
        const patientName = `${a.patient?.firstName} ${a.patient?.lastName}`.toLowerCase();
        const reason = (a.reason || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return patientName.includes(query) || reason.includes(query);
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      if (filter === "past") {
        return new Date(b.dateTime) - new Date(a.dateTime);
      }
      return new Date(a.dateTime) - new Date(b.dateTime);
    });

    setFilteredAppointments(filtered);
  }, [appointments, filter, searchQuery]);

  const loadAppointments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      // Get doctorId from user or fetch it
      let doctorId = user?.doctorId;
      if (!doctorId && user?.userId) {
        try {
          const { data: doctorData } = await http.get(`/doctors?userId=${user.userId}`);
          doctorId = doctorData?.data?.[0]?.id;
        } catch (err) {
          console.error("Error fetching doctorId:", err);
        }
      }
      
      // Fetch appointments for this doctor
      const endpoint = doctorId 
        ? `/appointments?doctorId=${doctorId}`
        : "/appointments";
      
      const { data } = await http.get(endpoint);
      const appts = data?.data?.appointments || data?.data || [];
      setAppointments(appts);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await http.patch(`/appointments/${id}/status`, { status });
      await loadAppointments();
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment status");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      NO_SHOW: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.SCHEDULED}`}>
        {status}
      </span>
    );
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
      mon: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      day: String(date.getDate()).padStart(2, "0"),
    };
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Appointments Management
          </h1>
          <p className="text-gray-500 mt-1">
            View and manage your patient appointments
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "upcoming"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "today"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "past"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="card-soft">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <FiCalendar className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => {
              const dt = formatDateTime(appointment.dateTime);
              return (
                <div
                  key={appointment.id}
                  className="py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <DateBadge mon={dt.mon} day={dt.day} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FiClock className="text-gray-400" />
                            <span>{dt.dayOfWeek}, {dt.time}</span>
                          </div>
                          {appointment.reason && (
                            <div className="flex items-center gap-2">
                              <FiUser className="text-gray-400" />
                              <span>{appointment.reason}</span>
                            </div>
                          )}
                          {appointment.patient?.phoneNumber && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📞</span>
                              <span>{appointment.patient.phoneNumber}</span>
                            </div>
                          )}
                        </div>

                        {appointment.notes && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-900">
                            <strong>Note:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.status === "SCHEDULED" && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateAppointmentStatus(appointment.id, "COMPLETED");
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as completed"
                        >
                          <FiCheck className="text-xl" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Cancel this appointment?")) {
                              updateAppointmentStatus(appointment.id, "CANCELLED");
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel appointment"
                        >
                          <FiX className="text-xl" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Appointment Details
                </h2>
                <p className="text-gray-600 mt-1">
                  {formatDateTime(selectedAppointment.dateTime).date}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Patient</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedAppointment.patient?.firstName} {selectedAppointment.patient?.lastName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p className="text-gray-900">
                    {formatDateTime(selectedAppointment.dateTime).date} at{" "}
                    {formatDateTime(selectedAppointment.dateTime).time}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
                </div>
              </div>

              {selectedAppointment.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Reason</label>
                  <p className="text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.patient && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact Information</label>
                  <div className="mt-2 space-y-1 text-gray-900">
                    {selectedAppointment.patient.phoneNumber && (
                      <p>📞 {selectedAppointment.patient.phoneNumber}</p>
                    )}
                    {selectedAppointment.patient.address && (
                      <p>📍 {selectedAppointment.patient.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedAppointment.status === "SCHEDULED" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    updateAppointmentStatus(selectedAppointment.id, "COMPLETED");
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    if (confirm("Cancel this appointment?")) {
                      updateAppointmentStatus(selectedAppointment.id, "CANCELLED");
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
