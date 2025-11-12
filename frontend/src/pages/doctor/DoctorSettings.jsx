// src/pages/doctor/DoctorSettings.jsx
import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiBell, FiCalendar, FiSave } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import http from "../../services/http";

export default function DoctorSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    specialization: "Cardiology",
    licenseNumber: "",
    phoneNumber: "",
    email: user?.email || "",
    yearsExperience: "",
  });

  useEffect(() => {
    loadDoctorProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    newPatientAlerts: true,
    prescriptionReminders: true,
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    startTime: "09:00",
    endTime: "17:00",
    appointmentDuration: "30",
  });

  const loadDoctorProfile = async () => {
    try {
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

      if (doctorId) {
        const { data } = await http.get(`/doctors/${doctorId}`);
        const doctor = data?.data;
        if (doctor) {
          setProfileData({
            firstName: doctor.firstName || "",
            lastName: doctor.lastName || "",
            specialization: doctor.specialization || "Cardiology",
            licenseNumber: doctor.licenseNumber || "",
            phoneNumber: doctor.phoneNumber || "",
            email: doctor.user?.email || user?.email || "",
            yearsExperience: doctor.yearsExperience?.toString() || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading doctor profile:", error);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      // Get doctorId
      let doctorId = user?.doctorId;
      if (!doctorId && user?.userId) {
        const { data: doctorData } = await http.get(`/doctors?userId=${user.userId}`);
        doctorId = doctorData?.data?.[0]?.id;
      }

      if (doctorId) {
        await http.put(`/doctors/${doctorId}`, profileData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Save password logic
    setSaved(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    // Save notifications logic
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    // Save schedule logic
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "password", label: "Security", icon: FiLock },
    { id: "notifications", label: "Notifications", icon: FiBell },
    { id: "schedule", label: "Schedule", icon: FiCalendar },
  ];

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card-soft p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-sky-100 text-sky-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="text-lg" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card-soft">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization
                    </label>
                    <select
                      value={profileData.specialization}
                      onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option>Cardiology</option>
                      <option>Dermatology</option>
                      <option>General Practice</option>
                      <option>Neurology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>Psychiatry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={profileData.licenseNumber}
                      onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData({ ...profileData, yearsExperience: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 btn-primary inline-flex items-center gap-2"
                >
                  <FiSave />
                  Save Changes
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleSavePassword}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 btn-primary inline-flex items-center gap-2"
                >
                  <FiSave />
                  Update Password
                </button>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <form onSubmit={handleSaveNotifications}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </p>
                        <p className="text-sm text-gray-500">
                          Receive notifications via {key.includes("email") ? "email" : key.includes("sms") ? "SMS" : "app"}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                        className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="mt-6 btn-primary inline-flex items-center gap-2"
                >
                  <FiSave />
                  Save Preferences
                </button>
              </form>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <form onSubmit={handleSaveSchedule}>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Working Schedule</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(scheduleSettings.workingDays).map(([day, enabled]) => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setScheduleSettings({
                              ...scheduleSettings,
                              workingDays: { ...scheduleSettings.workingDays, [day]: e.target.checked }
                            })}
                            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                          />
                          <span className="text-gray-900 capitalize">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.startTime}
                        onChange={(e) => setScheduleSettings({ ...scheduleSettings, startTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={scheduleSettings.endTime}
                        onChange={(e) => setScheduleSettings({ ...scheduleSettings, endTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Appointment Duration (minutes)
                      </label>
                      <select
                        value={scheduleSettings.appointmentDuration}
                        onChange={(e) => setScheduleSettings({ ...scheduleSettings, appointmentDuration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 btn-primary inline-flex items-center gap-2"
                >
                  <FiSave />
                  Save Schedule
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
