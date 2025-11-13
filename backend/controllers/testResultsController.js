// backend/controllers/testResultsController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* reuse messages pagination approach */
function safeLimit(v, def = 20, max = 100) {
  const n = Number(v ?? def);
  return Number.isFinite(n) ? Math.min(Math.max(1, n), max) : def;
}

/* Resolve current patient row; 403 if not a patient */
async function getCurrentPatientOr403(req, res) {
  const userId = req.user.userId;
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) {
    res.status(403).json({ success: false, message: "Not a patient" });
    return null;
  }
  return patient;
}

/*
GET /api/test-results
Query: cursor (id), limit, q
List only this patient’s results, newest first by takenAt then createdAt.
*/
exports.list = async (req, res) => {
  try {
    const patient = await getCurrentPatientOr403(req, res);
    if (!patient) return;

    const { cursor, q } = req.query;
    const limit = safeLimit(req.query.limit, 20, 50);

    const where = {
      patientId: patient.id,
      ...(q
        ? {
            name: { contains: q, mode: "insensitive" },
          }
        : {}),
    };

    const rows = await prisma.labResult.findMany({
      where,
      orderBy: [{ takenAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
      },
    });

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      takenAt: r.takenAt,
      doctor: r.doctor
        ? {
            firstName: r.doctor.firstName,
            lastName: r.doctor.lastName,
            specialization: r.doctor.specialization,
          }
        : null,
      attachmentAvailable: !!r.attachmentUrl,
    }));

    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
    res.json({ success: true, data: { items: data }, nextCursor });
  } catch (err) {
    console.error("testResults.list error", err);
    res.status(500).json({ success: false, message: "Failed to load test results" });
  }
};

/*
GET /api/test-results/:id
Full details, ownership enforced.
*/
exports.getOne = async (req, res) => {
  try {
    const patient = await getCurrentPatientOr403(req, res);
    if (!patient) return;

    const { id } = req.params;
    const r = await prisma.labResult.findFirst({
      where: { id, patientId: patient.id },
      include: {
        doctor: { select: { firstName: true, lastName: true, specialization: true } },
      },
    });

    if (!r) return res.status(404).json({ success: false, message: "Not found" });

    res.json({
      success: true,
      data: {
        id: r.id,
        name: r.name,
        status: r.status,
        takenAt: r.takenAt,
        doctor: r.doctor
          ? {
              firstName: r.doctor.firstName,
              lastName: r.doctor.lastName,
              specialization: r.doctor.specialization,
            }
          : null,
        attachmentUrl: r.attachmentUrl || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      },
    });
  } catch (err) {
    console.error("testResults.getOne error", err);
    res.status(500).json({ success: false, message: "Failed to load test result" });
  }
};

/*
GET /api/test-results/:id/download
For now, simple redirect to attachmentUrl if present.
*/
exports.download = async (req, res) => {
  try {
    const patient = await getCurrentPatientOr403(req, res);
    if (!patient) return;

    const { id } = req.params;
    const r = await prisma.labResult.findFirst({
      where: { id, patientId: patient.id },
      select: { attachmentUrl: true },
    });

    if (!r) return res.status(404).json({ success: false, message: "Not found" });
    if (!r.attachmentUrl)
      return res.status(404).json({ success: false, message: "No attachment for this result" });

    // Temporary: redirect; later we can stream/download with headers.
    res.redirect(r.attachmentUrl);
  } catch (err) {
    console.error("testResults.download error", err);
    res.status(500).json({ success: false, message: "Failed to download attachment" });
  }
};
