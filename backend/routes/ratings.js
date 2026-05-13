const router = require("express").Router();
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");

// POST /api/ratings — calificar a un profesional
router.post("/", auth, async (req, res) => {
  try {
    const { toUserId, score, comment } = req.body;
    if (!toUserId || !score)
      return res
        .status(400)
        .json({ message: "toUserId y score son requeridos" });
    if (score < 1 || score > 5)
      return res.status(400).json({ message: "score debe ser entre 1 y 5" });
    if (req.user.id === toUserId)
      return res
        .status(400)
        .json({ message: "No puedes calificarte a ti mismo" });

    const rating = await prisma.rating.upsert({
      where: { fromUserId_toUserId: { fromUserId: req.user.id, toUserId } },
      update: { score, comment },
      create: { fromUserId: req.user.id, toUserId, score, comment },
    });
    res.json(rating);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/ratings/:userId — ver calificaciones de un usuario
router.get("/:userId", auth, async (req, res) => {
  try {
    const ratings = await prisma.rating.findMany({
      where: { toUserId: parseInt(req.params.userId) },
      include: {
        fromUser: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(ratings);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
