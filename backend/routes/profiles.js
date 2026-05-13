const router = require("express").Router();
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

// GET /api/profiles/:id — perfil público de cualquier usuario
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        specialty: true,
        avatarUrl: true,
        createdAt: true,
        isApproved: true,
        ratingsReceived: {
          select: {
            score: true,
            comment: true,
            fromUser: { select: { id: true, name: true, avatarUrl: true } },
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const avgRating =
      user.ratingsReceived.length > 0
        ? user.ratingsReceived.reduce((sum, r) => sum + r.score, 0) /
          user.ratingsReceived.length
        : null;

    res.json({ ...user, avgRating });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/profiles/me — editar mi perfil (bio, specialty, avatarUrl)
router.patch("/me", auth, async (req, res) => {
  try {
    const { bio, specialty, avatarUrl, name } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { bio, specialty, avatarUrl, name },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        specialty: true,
        avatarUrl: true,
      },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/profiles — listar profesionales aprobados (para Discover)
router.get("/", auth, async (req, res) => {
  try {
    const { role } = req.query;
    const where = {
      isApproved: true,
      role: { in: ["NUTRITIONIST", "TRAINER"] },
    };
    if (role) where.role = role;

    const professionals = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        specialty: true,
        avatarUrl: true,
        ratingsReceived: { select: { score: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = professionals.map((p) => ({
      ...p,
      avgRating:
        p.ratingsReceived.length > 0
          ? p.ratingsReceived.reduce((s, r) => s + r.score, 0) /
            p.ratingsReceived.length
          : null,
      totalRatings: p.ratingsReceived.length,
      ratingsReceived: undefined,
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
