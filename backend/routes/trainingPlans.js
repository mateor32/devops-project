const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const roles = require("../middleware/roles");

router.use(authMiddleware);

// GET /api/training-plans/mine — plan activo del usuario
router.get("/mine", roles("USER"), async (req, res) => {
  const plan = await prisma.trainingPlan.findFirst({
    where: { userId: req.user.id, isActive: true },
    include: {
      trainingDays: {
        orderBy: { order: "asc" },
        include: {
          planExercises: {
            orderBy: { order: "asc" },
            include: {
              exerciseCatalog: true,
              machineCatalog: true,
            },
          },
        },
      },
    },
  });
  res.json(plan);
});

// GET /api/training-plans/my — planes creados por el entrenador
router.get("/my", roles("TRAINER"), async (req, res) => {
  const plans = await prisma.trainingPlan.findMany({
    where: { createdById: req.user.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(plans);
});

// POST /api/training-plans — crear plan
router.post("/", roles("TRAINER"), async (req, res) => {
  const { userId, title, goal, daysPerWeek, startDate, endDate } = req.body;
  if (!userId || !title || !goal || !startDate || !endDate) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }
  const plan = await prisma.trainingPlan.create({
    data: {
      userId: Number(userId),
      createdById: req.user.id,
      title,
      goal,
      daysPerWeek: daysPerWeek ? Number(daysPerWeek) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
  res.status(201).json(plan);
});

// POST /api/training-plans/:id/days — agregar día de entrenamiento
router.post("/:id/days", roles("TRAINER"), async (req, res) => {
  const { dayOfWeek, order, muscleGroup } = req.body;
  const day = await prisma.trainingDay.create({
    data: {
      dayOfWeek,
      order: order || 1,
      muscleGroup,
      trainingPlanId: Number(req.params.id),
    },
  });
  res.status(201).json(day);
});

// POST /api/training-plans/days/:dayId/exercises — agregar ejercicio al día
router.post("/days/:dayId/exercises", roles("TRAINER"), async (req, res) => {
  const {
    exerciseCatalogId,
    machineCatalogId,
    sets,
    reps,
    weight,
    restSeconds,
    order,
    notes,
  } = req.body;
  const exercise = await prisma.planExercise.create({
    data: {
      trainingDayId: Number(req.params.dayId),
      exerciseCatalogId: Number(exerciseCatalogId),
      machineCatalogId: machineCatalogId ? Number(machineCatalogId) : null,
      sets: Number(sets),
      reps: Number(reps),
      weight: weight ? Number(weight) : null,
      restSeconds: restSeconds ? Number(restSeconds) : 60,
      order: order || 1,
      notes,
    },
    include: { exerciseCatalog: true, machineCatalog: true },
  });
  res.status(201).json(exercise);
});

module.exports = router;
