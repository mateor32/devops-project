const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  const allowedRoles = ["USER", "NUTRITIONIST", "TRAINER"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Rol no válido" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(409).json({ message: "El correo ya está registrado" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      isApproved: role === "USER",
    },
  });

  res.status(201).json({ message: "Usuario registrado", userId: user.id });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña requeridos" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  if (
    (user.role === "NUTRITIONIST" || user.role === "TRAINER") &&
    !user.isApproved
  ) {
    return res
      .status(403)
      .json({ message: "Tu cuenta está pendiente de aprobación" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
