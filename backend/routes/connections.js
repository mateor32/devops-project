const router = require("express").Router();
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

// POST /api/connections — enviar solicitud de conexión
router.post("/", auth, async (req, res) => {
  try {
    const { toId } = req.body;
    if (!toId) return res.status(400).json({ message: "toId es requerido" });
    if (req.user.id === toId)
      return res
        .status(400)
        .json({ message: "No puedes conectarte contigo mismo" });

    const existing = await prisma.connectionRequest.findUnique({
      where: { fromId_toId: { fromId: req.user.id, toId } },
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Solicitud ya existe", status: existing.status });

    const request = await prisma.connectionRequest.create({
      data: { fromId: req.user.id, toId },
    });
    res.json(request);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/connections/mine — ver mis solicitudes recibidas (para profesionales)
router.get("/mine", auth, async (req, res) => {
  try {
    const requests = await prisma.connectionRequest.findMany({
      where: { toId: req.user.id },
      include: {
        from: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/connections/sent — solicitudes que yo envié
router.get("/sent", auth, async (req, res) => {
  try {
    const requests = await prisma.connectionRequest.findMany({
      where: { fromId: req.user.id },
      include: {
        to: { select: { id: true, name: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/connections/:id — aceptar o rechazar solicitud
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body; // ACCEPTED | REJECTED
    const id = parseInt(req.params.id);

    const conn = await prisma.connectionRequest.findUnique({ where: { id } });
    if (!conn)
      return res.status(404).json({ message: "Solicitud no encontrada" });
    if (conn.toId !== req.user.id)
      return res.status(403).json({ message: "No autorizado" });

    const updated = await prisma.connectionRequest.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/connections/status/:toId — ver estado de conexión con alguien
router.get("/status/:toId", auth, async (req, res) => {
  try {
    const toId = parseInt(req.params.toId);
    const conn = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { fromId: req.user.id, toId },
          { fromId: toId, toId: req.user.id },
        ],
      },
    });
    res.json({
      status: conn?.status || null,
      direction: conn?.fromId === req.user.id ? "sent" : "received",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
