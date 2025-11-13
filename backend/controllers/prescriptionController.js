// backend/controllers/prescriptionController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Helper: get Patient.id for the current user (if the user is a PATIENT account)
 */
async function getMyPatientId(userId) {
  const p = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });
  return p?.id || null;
}

/**
 * GET /api/medications
 * PATIENT: returns only their prescriptions
 * DOCTOR:  if ?patientId=... is provided, returns that patient's prescriptions (MVP)
 * Others:  return empty list (can be expanded later)
 *
 * Response shape (flat and UI-friendly):
 * [
 *   {
 *     id, medicationName, dosage, frequency,
 *     doctorName, doctorSpecialization,
 *     prescribedDate, status, refillDue
 *   }
 * ]
 */
exports.list = async (req, res) => {
  try {
    const role = req.user.role;
    let where = {};

    if (role === "PATIENT") {
      const myPid = await getMyPatientId(req.user.userId);
      if (!myPid) return res.json({ success: true, data: [] });
      where.patientId = myPid;
    } else if (role === "DOCTOR") {
      const qPid = (req.query.patientId || "").trim();
      if (!qPid) return res.json({ success: true, data: [] }); // MVP: require explicit patient id
      where.patientId = qPid;
    } else {
      return res.json({ success: true, data: [] });
    }

    const rows = await prisma.prescription.findMany({
      where,
      orderBy: { prescribedDate: "desc" },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    const data = rows.map((r) => {
      // Derive a simple status and refillDue from duration when it contains "days"
      const now = new Date();
      let refillDue = null;
      let status = "Active";

      if (r.duration) {
        const m = String(r.duration).match(/(\d+)\s*day/i);
        if (m) {
          const days = parseInt(m[1], 10);
          const due = new Date(r.prescribedDate);
          due.setDate(due.getDate() + days);
          refillDue = due.toISOString();
          if (due < now) status = "Expired";
        }
      }

      return {
        id: r.id,
        medicationName: r.medicationName,
        dosage: r.dosage,
        frequency: r.frequency,
        prescribedDate: r.prescribedDate,
        status,
        refillDue,
        doctorName: r.doctor
          ? `Dr. ${r.doctor.firstName} ${r.doctor.lastName}`
          : "Doctor",
        doctorSpecialization: r.doctor?.specialization || null,
      };
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("prescription.list error", err);
    return res.status(500).json({ success: false, message: "Failed to load medications" });
  }
};
