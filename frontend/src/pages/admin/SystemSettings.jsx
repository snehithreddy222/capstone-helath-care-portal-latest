import React, { useState } from "react";
import { FiShield, FiDatabase, FiMail, FiSettings, FiSave, FiBell, FiLock, FiClock } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // Security Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
    
    // Data Retention
    logRetentionDays: 90,
    deletedRecordsRetention: 30,
    backupFrequency: "daily",
    
    // Email Settings
    emailHost: "smtp.healthcare.com",
    emailPort: 587,
    emailUsername: "noreply@healthcare.com",
    emailFromName: "HealthApp",
    emailTLS: true,
    
    // Notifications
    emailNotifications: true,
    appointmentReminders: true,
    reminderHoursBefore: 24,
    systemAlerts: true,
    
    // System
    maintenanceMode: false,
    registrationEnabled: true,
    apiRateLimit: 1000,
    maxUploadSize: 10
  });

  const handleSave = (section) => {
    toast.success(`${section} settings saved successfully!`);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          System Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Configure security, data retention, and system preferences.
        </p>
      </div>

      {/* Security Settings */}
      <div className="card-soft mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="tile tile-blue">
            <FiShield />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
            <p className="text-sm text-gray-600">Configure password policies and authentication</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => handleChange("passwordMinLength", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="6"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="3"
                max="10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.passwordRequireUppercase}
                onChange={(e) => handleChange("passwordRequireUppercase", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Require uppercase letters</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.passwordRequireNumbers}
                onChange={(e) => handleChange("passwordRequireNumbers", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Require numbers</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.passwordRequireSpecialChars}
                onChange={(e) => handleChange("passwordRequireSpecialChars", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Require special characters</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => handleChange("twoFactorEnabled", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Enable Two-Factor Authentication</span>
            </label>
          </div>

          <button
            onClick={() => handleSave("Security")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiSave /> Save Security Settings
          </button>
        </div>
      </div>

      {/* Data Retention */}
      <div className="card-soft mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="tile tile-green">
            <FiDatabase />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Data Retention</h2>
            <p className="text-sm text-gray-600">Manage data storage and backup policies</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audit Log Retention (days)
              </label>
              <input
                type="number"
                value={settings.logRetentionDays}
                onChange={(e) => handleChange("logRetentionDays", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="30"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deleted Records Retention (days)
              </label>
              <input
                type="number"
                value={settings.deletedRecordsRetention}
                onChange={(e) => handleChange("deletedRecordsRetention", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="7"
                max="90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleChange("backupFrequency", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleChange("maxUploadSize", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                min="1"
                max="100"
              />
            </div>
          </div>

          <button
            onClick={() => handleSave("Data Retention")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiSave /> Save Data Settings
          </button>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="card-soft mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="tile tile-amber">
            <FiMail />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Configuration</h2>
            <p className="text-sm text-gray-600">Configure SMTP settings for email delivery</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.emailHost}
                onChange={(e) => handleChange("emailHost", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.emailPort}
                onChange={(e) => handleChange("emailPort", parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username/Email
              </label>
              <input
                type="text"
                value={settings.emailUsername}
                onChange={(e) => handleChange("emailUsername", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Name
              </label>
              <input
                type="text"
                value={settings.emailFromName}
                onChange={(e) => handleChange("emailFromName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.emailTLS}
              onChange={(e) => handleChange("emailTLS", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Use TLS/SSL Encryption</span>
          </label>

          <button
            onClick={() => handleSave("Email")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiSave /> Save Email Settings
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card-soft mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="tile tile-blue">
            <FiBell />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            <p className="text-sm text-gray-600">Configure system and user notifications</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange("emailNotifications", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Enable email notifications</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.appointmentReminders}
              onChange={(e) => handleChange("appointmentReminders", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Send appointment reminders</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Hours Before Appointment
            </label>
            <input
              type="number"
              value={settings.reminderHoursBefore}
              onChange={(e) => handleChange("reminderHoursBefore", parseInt(e.target.value))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="1"
              max="72"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.systemAlerts}
              onChange={(e) => handleChange("systemAlerts", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Enable system alerts for admins</span>
          </label>

          <button
            onClick={() => handleSave("Notification")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiSave /> Save Notification Settings
          </button>
        </div>
      </div>

      {/* System Control */}
      <div className="card-soft">
        <div className="flex items-center gap-3 mb-6">
          <div className="tile tile-red">
            <FiSettings />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Control</h2>
            <p className="text-sm text-gray-600">Global system settings and controls</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-lg">
            <div>
              <p className="font-medium text-amber-900">Maintenance Mode</p>
              <p className="text-sm text-amber-700">Temporarily disable user access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) => handleChange("registrationEnabled", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Allow new user registrations</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Rate Limit (requests/hour)
            </label>
            <input
              type="number"
              value={settings.apiRateLimit}
              onChange={(e) => handleChange("apiRateLimit", parseInt(e.target.value))}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              min="100"
              max="10000"
              step="100"
            />
          </div>

          <button
            onClick={() => handleSave("System Control")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
          >
            <FiSave /> Save System Settings
          </button>
        </div>
      </div>
    </div>
  );
}
