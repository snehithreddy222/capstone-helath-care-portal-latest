// src/pages/doctor/DoctorMedicalRecords.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiFileText, FiX, FiRefreshCw } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorMedicalRecords() {
  const location = useLocation();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [formData, setFormData] = useState({
    patientId: location.state?.patientId || "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    notes: "",
    visitDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
    
    // Auto-refresh every 45 seconds
    const interval = setInterval(() => {
      loadData(true); // Silent refresh
    }, 45000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = records.filter((r) => {
        const patient = patients.find((p) => p.id === r.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
        const diagnosis = (r.diagnosis || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return patientName.includes(query) || diagnosis.includes(query);
      });
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [searchQuery, records, patients]);

  const loadData = async (silent = false) => {
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
      
      // Load medical records for this doctor
      const recordsEndpoint = doctorId 
        ? `/medical-records?doctorId=${doctorId}`
        : "/medical-records";
      const { data: recordsRes } = await http.get(recordsEndpoint).catch(() => ({ data: { data: [] } }));
      const recordsData = recordsRes?.data || [];
      setRecords(recordsData);
      setFilteredRecords(recordsData);

      // Load patients from appointments
      const appointmentsEndpoint = doctorId 
        ? `/appointments?doctorId=${doctorId}`
        : "/appointments";
      const { data: appointmentsRes } = await http.get(appointmentsEndpoint);
      const appointments = appointmentsRes?.data?.appointments || appointmentsRes?.data || [];
      const uniquePatients = new Map();
      appointments.forEach((appt) => {
        if (appt.patient && !uniquePatients.has(appt.patientId)) {
          uniquePatients.set(appt.patientId, { ...appt.patient, id: appt.patientId });
        }
      });
      setPatients(Array.from(uniquePatients.values()));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await http.post("/medical-records", formData);
      setShowCreateModal(false);
      setFormData({
        patientId: "",
        diagnosis: "",
        symptoms: "",
        treatment: "",
        notes: "",
        visitDate: new Date().toISOString().split("T")[0],
      });
      await loadData();
    } catch (error) {
      console.error("Error creating record:", error);
      alert("Failed to create medical record");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : "Unknown Patient";
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
            Medical Records
          </h1>
          <p className="text-gray-500 mt-1">Create and manage patient medical records</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2 px-4 h-10 rounded-md"
          >
            <FiPlus className="text-[18px]" />
            New Record
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="card-soft py-12 text-center text-gray-500">
          Loading records...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card-soft py-12 text-center">
          <FiFileText className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500">
            {searchQuery ? "No records found" : "No medical records yet"}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn-primary inline-flex items-center gap-2 px-4 h-10 rounded-md"
          >
            <FiPlus />
            Create First Record
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="card-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getPatientName(record.patientId)}
                    </h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(record.visitDate)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      {record.diagnosis}
                    </span>
                  </div>
                  {record.symptoms && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Symptoms:</strong> {record.symptoms}
                    </p>
                  )}
                  {record.treatment && (
                    <p className="text-sm text-gray-600">
                      <strong>Treatment:</strong> {record.treatment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Medical Record</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Date *
                </label>
                <input
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="e.g., Hypertension, Type 2 Diabetes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Describe patient symptoms..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Plan
                </label>
                <textarea
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Describe treatment plan..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                >
                  Create Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Medical Record</h2>
                <p className="text-gray-600 mt-1">{formatDate(selectedRecord.visitDate)}</p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Patient</label>
                <p className="text-lg font-semibold text-gray-900">
                  {getPatientName(selectedRecord.patientId)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Diagnosis</label>
                <p className="text-gray-900">{selectedRecord.diagnosis}</p>
              </div>

              {selectedRecord.symptoms && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Symptoms</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Treatment Plan</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedRecord.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p>Created: {formatDate(selectedRecord.createdAt)}</p>
                {selectedRecord.updatedAt !== selectedRecord.createdAt && (
                  <p>Last Updated: {formatDate(selectedRecord.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
