// src/pages/doctor/DoctorSchedule.jsx
import React, { useState, useEffect } from "react";
import { FiClock, FiCalendar, FiChevronLeft, FiChevronRight, FiRefreshCw } from "react-icons/fi";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState("week"); // week or day

  useEffect(() => {
    const fetchData = async () => {
      await loadSchedule();
    };
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSchedule(true); // Silent refresh
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadSchedule = async (silent = false) => {
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
      console.error("Error loading schedule:", error);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchedule();
  };

  const getWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((appt) => {
      const apptDate = new Date(appt.dateTime).toISOString().split("T")[0];
      return apptDate === dateStr;
    });
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Schedule Management
          </h1>
          <p className="text-gray-500 mt-1">View and manage your work schedule</p>
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

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (view === "week" ? navigateWeek(-1) : navigateDay(-1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          
          <div className="text-center min-w-[200px]">
            <h2 className="text-xl font-bold text-gray-900">
              {view === "week"
                ? `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </h2>
          </div>

          <button
            onClick={() => (view === "week" ? navigateWeek(1) : navigateDay(1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight className="text-xl" />
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("day")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "day"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === "week"
                ? "bg-sky-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Schedule View */}
      {loading ? (
        <div className="card-soft py-12 text-center text-gray-500">
          Loading schedule...
        </div>
      ) : view === "week" ? (
        <div className="card-soft overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-left text-sm font-semibold text-gray-600 w-20">Time</th>
                {weekDays.map((day, i) => (
                  <th key={i} className={`p-3 text-center text-sm font-semibold ${
                    isToday(day) ? "text-sky-700" : "text-gray-600"
                  }`}>
                    <div>{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    <div className={`text-lg font-bold ${isToday(day) ? "text-sky-700" : "text-gray-900"}`}>
                      {day.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour} className="border-b border-gray-100">
                  <td className="p-3 text-sm text-gray-600 align-top">
                    {hour}:00 {hour < 12 ? "AM" : "PM"}
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const dayAppts = getAppointmentsForDate(day);
                    const hourAppts = dayAppts.filter((appt) => {
                      const apptHour = new Date(appt.dateTime).getHours();
                      return apptHour === hour;
                    });

                    return (
                      <td key={dayIndex} className={`p-1 align-top ${
                        isToday(day) ? "bg-sky-50" : ""
                      }`}>
                        {hourAppts.map((appt) => (
                          <div
                            key={appt.id}
                            className={`mb-1 p-2 rounded text-xs ${
                              appt.status === "SCHEDULED"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : appt.status === "COMPLETED"
                                ? "bg-green-100 text-green-900 border border-green-300"
                                : "bg-gray-100 text-gray-900 border border-gray-300"
                            }`}
                          >
                            <div className="font-semibold">{formatTime(appt.dateTime)}</div>
                            <div className="truncate">
                              {appt.patient?.firstName} {appt.patient?.lastName}
                            </div>
                            <div className="truncate text-[10px] opacity-80">
                              {appt.reason}
                            </div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-soft">
          <div className="space-y-2">
            {hours.map((hour) => {
              const hourAppts = getAppointmentsForDate(currentDate).filter((appt) => {
                const apptHour = new Date(appt.dateTime).getHours();
                return apptHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4 border-b border-gray-100 pb-4 mb-4 last:border-0">
                  <div className="w-24 pt-2">
                    <div className="text-sm font-semibold text-gray-600">
                      {hour}:00 {hour < 12 ? "AM" : "PM"}
                    </div>
                  </div>
                  <div className="flex-1">
                    {hourAppts.length === 0 ? (
                      <div className="py-2 text-gray-400 text-sm italic">No appointments</div>
                    ) : (
                      <div className="space-y-2">
                        {hourAppts.map((appt) => (
                          <div
                            key={appt.id}
                            className={`p-4 rounded-lg border ${
                              appt.status === "SCHEDULED"
                                ? "bg-blue-50 border-blue-200"
                                : appt.status === "COMPLETED"
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {appt.patient?.firstName} {appt.patient?.lastName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatTime(appt.dateTime)} • {appt.reason || "General Consultation"}
                                </div>
                                {appt.patient?.phoneNumber && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    📞 {appt.patient.phoneNumber}
                                  </div>
                                )}
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                appt.status === "SCHEDULED"
                                  ? "bg-blue-100 text-blue-700"
                                  : appt.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <FiCalendar />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAppointmentsForDate(new Date()).filter(a => a.status === "SCHEDULED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-blue">
              <FiClock />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {weekDays.reduce((total, day) => {
                  return total + getAppointmentsForDate(day).filter(a => a.status === "SCHEDULED").length;
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg grid place-items-center bg-green-50 text-green-700 border border-green-200">
              ✓
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAppointmentsForDate(new Date()).filter(a => a.status === "COMPLETED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-soft">
          <div className="flex items-center gap-3">
            <div className="tile tile-amber">
              ⏰
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900">
                {13 - getAppointmentsForDate(new Date()).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
