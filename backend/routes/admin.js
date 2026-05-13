const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const roles = require("../middleware/roles");

router.use(authMiddleware);
router.use(roles("ADMIN"));

// GET /api/admin/pending — profesionales pendientes de aprobación
router.get("/pending", async (req, res) => {
  const pending = await prisma.user.findMany({
    where: {
      role: { in: ["NUTRITIONIST", "TRAINER"] },
      isApproved: false,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(pending);
});

// GET /api/admin/approved — profesionales ya aprobados
router.get("/approved", async (req, res) => {
  const approved = await prisma.user.findMany({
    where: {
      role: { in: ["NUTRITIONIST", "TRAINER"] },
      isApproved: true,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(approved);
});

// PATCH /api/admin/approve/:id — aprobar profesional
router.patch("/approve/:id", async (req, res) => {
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { isApproved: true },
  });
  res.json({ message: "Profesional aprobado", user });
});

// PATCH /api/admin/reject/:id — rechazar (eliminar) profesional
router.patch("/reject/:id", async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Profesional rechazado y eliminado" });
});

module.exports = router;
