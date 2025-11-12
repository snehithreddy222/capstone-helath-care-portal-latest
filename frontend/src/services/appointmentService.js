
import http from "./http";
import { authService } from "./authService";

function toBadgeFromDate(dateISO) {
  const d = new Date(dateISO);
  const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  return { mon, day };
}

function mapServerAppointment(a) {
  // Accept either dateTime or date + time from server
  const iso =
    a?.dateTime ??
    (a?.date && a?.time ? `${a.date}T${a.time}:00` : undefined);

  const d = iso ? new Date(iso) : new Date();
  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    id: a.id,
    dateTime: d,
    date: d.toISOString().slice(0, 10),
    time,
    clinicianId: a.doctorId,
    clinicianName: a?.doctor
      ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
      : a?.clinicianName || "",
    specialty: a?.doctor?.specialization || a?.specialty || "",
    location: a?.location || "",
    title: a?.reason || "Visit",
    status: a?.status || "SCHEDULED",
    notes: a?.notes || "",
  };
}

function isFuture(dt) {
  return dt.getTime() >= Date.now();
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export const appointmentService = {
  todayISO,

  toBadge(dateISO) {
    return toBadgeFromDate(dateISO);
  },

  async ensureLoggedIn() {
    const u = authService.getCurrentUser();
    if (!u?.token) throw new Error("Not authenticated");
  },

  async listUpcoming() {
    await this.ensureLoggedIn();
    try {
      const { data } = await http.get("/appointments/mine");
      const list = Array.isArray(data?.data)
        ? data.data.map(mapServerAppointment)
        : [];
      const filtered = list
        .filter((a) => a.status === "SCHEDULED" && isFuture(a.dateTime))
        .sort((a, b) => a.dateTime - b.dateTime);
      return filtered;
    } catch (e) {
      if (e.status === 404) return []; // backend route missing for now
      throw e;
    }
  },

  async listPast() {
    await this.ensureLoggedIn();
    try {
      const { data } = await http.get("/appointments/mine");
      const list = Array.isArray(data?.data)
        ? data.data.map(mapServerAppointment)
        : [];
      const filtered = list
        .filter((a) => a.status === "COMPLETED")
        .sort((a, b) => b.dateTime - a.dateTime);
      return filtered;
    } catch (e) {
      if (e.status === 404) return []; // backend route missing for now
      throw e;
    }
  },

  async getById(id) {
    await this.ensureLoggedIn();
    const { data } = await http.get(`/appointments/${id}`);
    return mapServerAppointment(data?.data);
  },

  async create({ clinicianId, date, time, reason, notes }) {
    await this.ensureLoggedIn();
    let u = authService.getCurrentUser();
    
    // If patientId is missing, fetch it from the profile
    if (!u?.patientId) {
      try {
        const { data } = await http.get("/auth/profile");
        if (data?.data?.patientId) {
          // Update the local user object with patientId
          const updatedUser = { ...u, patientId: data.data.patientId };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          u = updatedUser;
        }
      } catch (error) {
        console.error("Error fetching patient profile:", error);
      }
    }
    
    if (!u?.patientId) throw new Error("No patient profile linked to this user");

    const [hh, mm] = time.split(":");
    const iso = new Date(
      `${date}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`
    ).toISOString();

    const { data } = await http.post("/appointments", {
      patientId: u.patientId,
      doctorId: clinicianId,
      dateTime: iso,
      reason,
      notes,
    });
    return mapServerAppointment(data?.data);
  },

  async update(id, payload) {
    await this.ensureLoggedIn();
    const { clinicianId, date, time, reason, notes } = payload;
    const [hh, mm] = time.split(":");
    const iso = new Date(
      `${date}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`
    ).toISOString();

    const { data } = await http.put(`/appointments/${id}`, {
      doctorId: clinicianId,
      dateTime: iso,
      reason,
      notes,
    });
    return mapServerAppointment(data?.data);
  },

  async cancel(id) {
    await this.ensureLoggedIn();
    await http.patch(`/appointments/${id}/cancel`);
    return true;
  },

  async getAvailability(date, clinicianId) {
    try {
      const { data } = await http.get("/appointments/availability", {
        params: { date, doctorId: clinicianId },
      });
      // Expect e.g. { data: { slots: ["09:00","09:30", ...] } }
      const slots = data?.data?.slots || data?.slots || [];
      return Array.isArray(slots) ? slots : [];
    } catch {
      // Fallback demo slots
      return ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"];
    }
  },
};
