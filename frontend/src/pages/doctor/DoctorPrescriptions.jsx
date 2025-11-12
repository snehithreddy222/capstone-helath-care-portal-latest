// src/pages/doctor/DoctorPrescriptions.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiX, FiRefreshCw } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorPrescriptions() {
  const location = useLocation();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [formData, setFormData] = useState({
    patientId: location.state?.patientId || "",
    medicationName: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
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
      const filtered = prescriptions.filter((p) => {
        const patient = patients.find((pat) => pat.id === p.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
        const medication = (p.medicationName || "").toLowerCase();
        const query = searchQuery.toLowerCase();
        return patientName.includes(query) || medication.includes(query);
      });
      setFilteredPrescriptions(filtered);
    } else {
      setFilteredPrescriptions(prescriptions);
    }
  }, [searchQuery, prescriptions, patients]);

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
      
      // Load prescriptions for this doctor
      const prescriptionsEndpoint = doctorId 
        ? `/prescriptions?doctorId=${doctorId}`
        : "/prescriptions";
      const { data: prescriptionsRes } = await http.get(prescriptionsEndpoint).catch(() => ({ data: { data: [] } }));
      const prescriptionsData = prescriptionsRes?.data || [];
      setPrescriptions(prescriptionsData);
      setFilteredPrescriptions(prescriptionsData);

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
      await http.post("/prescriptions", formData);
      setShowCreateModal(false);
      setFormData({
        patientId: "",
        medicationName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });
      await loadData();
      alert("Prescription created successfully!");
    } catch (error) {
      console.error("Error creating prescription:", error);
      alert("Failed to create prescription");
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
            Prescriptions
          </h1>
          <p className="text-gray-500 mt-1">Create and manage patient prescriptions</p>
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
            New Prescription
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      {loading ? (
        <div className="card-soft py-12 text-center text-gray-500">
          Loading prescriptions...
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="card-soft py-12 text-center">
          <span className="mx-auto text-4xl mb-3 block">💊</span>
          <p className="text-gray-500">
            {searchQuery ? "No prescriptions found" : "No prescriptions yet"}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn-primary inline-flex items-center gap-2 px-4 h-10 rounded-md"
          >
            <FiPlus />
            Create First Prescription
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="card-soft cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPrescription(prescription)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {getPatientName(prescription.patientId)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(prescription.prescribedDate)}
                  </p>
                </div>
                <span className="text-2xl">💊</span>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <p className="font-semibold text-sky-900">
                    {prescription.medicationName}
                  </p>
                  <p className="text-sm text-sky-700 mt-1">
                    {prescription.dosage} • {prescription.frequency}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Duration:</strong> {prescription.duration}</p>
                  {prescription.instructions && (
                    <p className="mt-1 text-xs">
                      <strong>Instructions:</strong> {prescription.instructions.slice(0, 80)}
                      {prescription.instructions.length > 80 && "..."}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 text-sky-600 text-sm font-medium hover:underline">
                View Full Details →
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
              <h2 className="text-2xl font-bold text-gray-900">Write Prescription</h2>
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
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  placeholder="e.g., Amoxicillin, Lisinopril"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 10ml"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <input
                    type="text"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="e.g., Twice daily, Every 8 hours"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 7 days, 2 weeks, 1 month"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take with food, Avoid alcohol, Take before bedtime"
                  rows={4}
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
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {selectedPrescription && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
                <p className="text-gray-600 mt-1">
                  Prescribed on {formatDate(selectedPrescription.prescribedDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Patient</label>
                <p className="text-lg font-semibold text-gray-900">
                  {getPatientName(selectedPrescription.patientId)}
                </p>
              </div>

              <div className="p-4 bg-sky-50 border-2 border-sky-200 rounded-lg">
                <label className="text-sm font-medium text-sky-700">Medication</label>
                <p className="text-2xl font-bold text-sky-900 mt-1">
                  {selectedPrescription.medicationName}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Dosage</label>
                  <p className="text-gray-900 font-semibold">{selectedPrescription.dosage}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Frequency</label>
                  <p className="text-gray-900 font-semibold">{selectedPrescription.frequency}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-gray-900 font-semibold">{selectedPrescription.duration}</p>
              </div>

              {selectedPrescription.instructions && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Special Instructions</label>
                  <p className="text-gray-900 whitespace-pre-wrap mt-1">
                    {selectedPrescription.instructions}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    alert("Print functionality would be implemented here");
                  }}
                  className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                >
                  🖨️ Print Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
