const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const roles = require("../middleware/roles");

router.use(authMiddleware);
router.use(roles("NUTRITIONIST", "TRAINER"));

// GET /api/professional/clients — clientes asignados a este profesional
router.get("/clients", async (req, res) => {
  const field =
    req.user.role === "NUTRITIONIST" ? "nutritionistId" : "trainerId";
  const assignments = await prisma.professionalAssignment.findMany({
    where: { [field]: req.user.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  const clients = assignments.map((a) => a.user);
  res.json(clients);
});

// POST /api/professional/assign — asignar un cliente a este profesional
router.post("/assign", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId requerido" });

  const field =
    req.user.role === "NUTRITIONIST" ? "nutritionistId" : "trainerId";

  const existing = await prisma.professionalAssignment.findUnique({
    where: { userId: Number(userId) },
  });

  let assignment;
  if (existing) {
    assignment = await prisma.professionalAssignment.update({
      where: { userId: Number(userId) },
      data: { [field]: req.user.id },
    });
  } else {
    assignment = await prisma.professionalAssignment.create({
      data: { userId: Number(userId), [field]: req.user.id },
    });
  }

  res.json({ message: "Cliente asignado", assignment });
});

module.exports = router;
