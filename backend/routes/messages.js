const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// GET /api/messages/:otherUserId — conversación entre dos usuarios
router.get("/:otherUserId", async (req, res) => {
  const myId = req.user.id;
  const otherId = Number(req.params.otherUserId);

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Marcar como leídos los mensajes recibidos
  await prisma.message.updateMany({
    where: { senderId: otherId, receiverId: myId, isRead: false },
    data: { isRead: true },
  });

  res.json(messages);
});

// POST /api/messages — enviar mensaje
router.post("/", async (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content?.trim()) {
    return res
      .status(400)
      .json({ message: "receiverId y content son requeridos" });
  }
  const message = await prisma.message.create({
    data: {
      senderId: req.user.id,
      receiverId: Number(receiverId),
      content: content.trim(),
    },
  });
  res.status(201).json(message);
});

module.exports = router;
