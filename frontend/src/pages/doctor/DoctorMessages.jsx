// src/pages/doctor/DoctorMessages.jsx
import React, { useState, useEffect } from "react";
import { FiSend, FiSearch, FiUser, FiRefreshCw } from "react-icons/fi";
import http from "../../services/http";
import { useAuth } from "../../context/AuthContext";

export default function DoctorMessages() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await loadPatients();
    };
    fetchData();
    
    // Auto-refresh every 20 seconds for real-time messaging
    const interval = setInterval(() => {
      loadPatients(true); // Silent refresh
      if (selectedPatient) {
        loadMessages(selectedPatient.id, true);
      }
    }, 20000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadMessages(selectedPatient.id);
    }
  }, [selectedPatient]);

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
      
      const endpoint = doctorId 
        ? `/appointments?doctorId=${doctorId}`
        : "/appointments";
      const { data: appointmentsRes } = await http.get(endpoint);
      const appointments = appointmentsRes?.data?.appointments || appointmentsRes?.data || [];
      
      const uniquePatients = new Map();
      appointments.forEach((appt) => {
        if (appt.patient && !uniquePatients.has(appt.patientId)) {
          uniquePatients.set(appt.patientId, {
            ...appt.patient,
            id: appt.patientId,
            lastContact: appt.dateTime,
            unreadCount: 0, // Can be fetched from messages API
          });
        }
      });
      
      const patientsList = Array.from(uniquePatients.values());
      setPatients(patientsList);
      
      if (!selectedPatient && patientsList.length > 0) {
        setSelectedPatient(patientsList[0]);
      }
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
    if (selectedPatient) {
      await loadMessages(selectedPatient.id);
    }
  };

  const loadMessages = async (patientId) => {
    try {
      // Try to fetch real messages, fallback to demo
      try {
        const { data } = await http.get(`/messages?patientId=${patientId}`);
        if (data?.data && data.data.length > 0) {
          setMessages(data.data);
          return;
        }
      } catch {
        // Fallback to demo messages if API not available
      }
      
      // Demo messages - in real app, would fetch from API
      const demoMessages = [
        {
          id: "1",
          senderId: patientId,
          senderType: "patient",
          content: "Hello Doctor, I wanted to follow up on my recent appointment.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          senderId: "doctor-id",
          senderType: "doctor",
          content: "Hello! I'm glad you reached out. How are you feeling after starting the new medication?",
          timestamp: new Date(Date.now() - 3000000).toISOString(),
        },
        {
          id: "3",
          senderId: patientId,
          senderType: "patient",
          content: "I've been feeling much better, thank you! The symptoms have reduced significantly.",
          timestamp: new Date(Date.now() - 2400000).toISOString(),
        },
        {
          id: "4",
          senderId: "doctor-id",
          senderType: "doctor",
          content: "That's wonderful to hear! Please continue with the prescribed dosage and let me know if you experience any side effects.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      setMessages(demoMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient) return;

    const message = {
      id: Date.now().toString(),
      senderId: "doctor-id",
      senderType: "doctor",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // In real app, would send to API
    try {
      // await http.post("/messages", { ... });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const filteredPatients = patients.filter((p) => {
    if (!searchQuery) return true;
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-full">
      <div className="flex items-start justify-between mb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
          Messages
        </h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="card-soft p-0 overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex h-full">
          {/* Patients List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
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

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No patients found</div>
              ) : (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPatient?.id === patient.id ? "bg-sky-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-sky-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          {patient.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-sky-600 text-white text-xs rounded-full">
                              {patient.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          Last contact: {formatTime(patient.lastContact)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedPatient ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <FiUser className="text-sky-700 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "doctor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.senderType === "doctor"
                          ? "bg-sky-600 text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderType === "doctor"
                            ? "text-sky-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FiSend />
                    Send
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <FiUser className="mx-auto text-4xl mb-3" />
                <p>Select a patient to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
