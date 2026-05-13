const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// GET /api/professional/mine — obtener mi asignación de profesionales (para usuario)
router.get("/mine", async (req, res) => {
  const assignment = await prisma.professionalAssignment.findUnique({
    where: { userId: req.user.id },
    include: {
      nutritionist: { select: { id: true, name: true, email: true } },
      trainer: { select: { id: true, name: true, email: true } },
    },
  });
  res.json(assignment);
});

module.exports = router;
