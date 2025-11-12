// src/pages/doctor/DoctorPatients.jsx
import React, { useEffect, useState } from "react";
import { FiSearch, FiUser, FiPhone, FiCalendar, FiFileText, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorPatients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await loadPatients();
    };
    fetchData();
    
    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      loadPatients(true); // Silent refresh
    }, 45000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = patients.filter((p) => {
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || (p.phoneNumber || "").includes(query);
      });
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchQuery, patients]);

  const loadPatients = async (silent = false) => {
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
      
      // Get all appointments for this doctor
      const endpoint = doctorId 
        ? `/appointments?doctorId=${doctorId}`
        : "/appointments";
        
      const { data: appointmentsRes } = await http.get(endpoint);
      const appointments = appointmentsRes?.data?.appointments || appointmentsRes?.data || [];

      // Get unique patients from appointments
      const uniquePatients = new Map();
      appointments.forEach((appt) => {
        if (appt.patient && !uniquePatients.has(appt.patientId)) {
          const patientData = {
            ...appt.patient,
            id: appt.patientId,
            lastVisit: appt.dateTime,
            totalVisits: appointments.filter((a) => a.patientId === appt.patientId).length,
            upcomingAppointments: appointments.filter(
              (a) => a.patientId === appt.patientId && a.status === "SCHEDULED" && new Date(a.dateTime) > new Date()
            ).length,
          };
          uniquePatients.set(appt.patientId, patientData);
        }
      });

      const patientsList = Array.from(uniquePatients.values());
      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
  };

  const loadPatientDetails = async (patientId) => {
    try {
      // Get doctorId
      let doctorId = user?.doctorId;
      if (!doctorId && user?.userId) {
        try {
          const { data: doctorData } = await http.get(`/doctors?userId=${user.userId}`);
          doctorId = doctorData?.data?.[0]?.id;
        } catch (err) {
          console.error("Error fetching doctorId:", err);
        }
      }
      
      const endpoint = doctorId 
        ? `/appointments?doctorId=${doctorId}`
        : "/appointments";
      
      const [appointmentsRes, recordsRes] = await Promise.all([
        http.get(endpoint),
        http.get(`/medical-records?patientId=${patientId}`).catch(() => ({ data: { data: [] } })),
      ]);

      const allAppointments = appointmentsRes?.data?.appointments || appointmentsRes?.data?.data || [];
      const patientAppointments = allAppointments.filter((a) => a.patientId === patientId);
      const records = recordsRes?.data?.data || [];

      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        setSelectedPatient({
          ...patient,
          appointments: patientAppointments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)),
          medicalRecords: records,
        });
      }
    } catch (error) {
      console.error("Error loading patient details:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Patient Management
          </h1>
          <p className="text-gray-500 mt-1">View and manage your patient records</p>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading patients...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="card-soft py-12 text-center">
          <FiUser className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">
            {searchQuery ? "No patients found" : "No patients yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="card-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => loadPatientDetails(patient.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <FiUser className="text-sky-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {patient.gender} • Age {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {patient.phoneNumber && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="text-gray-400" />
                    <span>{patient.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar className="text-gray-400" />
                  <span>Last visit: {formatDate(patient.lastVisit)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                <div>
                  <span className="text-gray-600">Total Visits: </span>
                  <span className="font-semibold text-gray-900">{patient.totalVisits}</span>
                </div>
                {patient.upcomingAppointments > 0 && (
                  <div>
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                      {patient.upcomingAppointments} upcoming
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center">
                  <FiUser className="text-sky-700 text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <p className="text-gray-600">
                    Patient ID: {selectedPatient.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Patient Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-gray-900">{selectedPatient.gender}</p>
                </div>
                {selectedPatient.bloodGroup && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Blood Group</label>
                    <p className="text-gray-900">{selectedPatient.bloodGroup}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {selectedPatient.phoneNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedPatient.phoneNumber}</p>
                  </div>
                )}
                {selectedPatient.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{selectedPatient.address}</p>
                  </div>
                )}
                {selectedPatient.emergencyContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                    <p className="text-gray-900">{selectedPatient.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedPatient.allergies && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ Allergies</h3>
                <p className="text-red-800">{selectedPatient.allergies}</p>
              </div>
            )}

            {/* Appointment History */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar />
                Appointment History
              </h3>
              {selectedPatient.appointments?.length === 0 ? (
                <p className="text-gray-500 text-sm">No appointments found</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedPatient.appointments?.slice(0, 5).map((appt) => (
                    <div key={appt.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{appt.reason || "General Consultation"}</p>
                          <p className="text-gray-600">{formatDate(appt.dateTime)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appt.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          appt.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Records */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiFileText />
                Medical Records
              </h3>
              {selectedPatient.medicalRecords?.length === 0 ? (
                <p className="text-gray-500 text-sm">No medical records found</p>
              ) : (
                <div className="space-y-2">
                  {selectedPatient.medicalRecords?.map((record) => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <p className="font-medium text-gray-900">{record.diagnosis}</p>
                      <p className="text-gray-600 text-xs">{formatDate(record.visitDate)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  navigate("/doctor/medical-records", { state: { patientId: selectedPatient.id } });
                }}
                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
              >
                Create Medical Record
              </button>
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  navigate("/doctor/prescriptions", { state: { patientId: selectedPatient.id } });
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Write Prescription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
