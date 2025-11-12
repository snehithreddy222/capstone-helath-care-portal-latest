
import http from "./http";

export const doctorService = {
  async list() {
    try {
      const { data } = await http.get("/doctors", { params: { limit: 50 } });
      console.log("Doctors API response:", data);
      const arr = data?.data || data || [];
      console.log("Parsed doctors array:", arr);
      return arr.map((d) => ({
        id: d.id,
        name: d.name || `Dr. ${d.firstName} ${d.lastName}`,
        specialization: d.specialization || "",
        location: d.location || "",
      }));
    } catch (error) {
      console.error("Error fetching doctors:", error);
      // Return empty array so user sees no doctors instead of fake data
      return [];
    }
  },
};
