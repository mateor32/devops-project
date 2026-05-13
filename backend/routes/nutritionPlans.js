const router = require("express").Router();
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth");
const roles = require("../middleware/roles");

router.use(authMiddleware);

// GET /api/nutrition-plans/mine — plan activo del usuario
router.get("/mine", roles("USER"), async (req, res) => {
  const plan = await prisma.nutritionPlan.findFirst({
    where: { userId: req.user.id, isActive: true },
    include: {
      meals: {
        include: {
          mealFoodItems: {
            include: { foodCatalog: true },
          },
        },
      },
    },
  });
  res.json(plan);
});

// GET /api/nutrition-plans/my — planes creados por el nutricionista
router.get("/my", roles("NUTRITIONIST"), async (req, res) => {
  const plans = await prisma.nutritionPlan.findMany({
    where: { createdById: req.user.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(plans);
});

// POST /api/nutrition-plans — crear plan
router.post("/", roles("NUTRITIONIST"), async (req, res) => {
  const { userId, title, goal, dailyCalories, startDate, endDate } = req.body;
  if (!userId || !title || !goal || !startDate || !endDate) {
    return res.status(400).json({ message: "Faltan campos requeridos" });
  }
  const plan = await prisma.nutritionPlan.create({
    data: {
      userId: Number(userId),
      createdById: req.user.id,
      title,
      goal,
      dailyCalories: dailyCalories ? Number(dailyCalories) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
  res.status(201).json(plan);
});

// POST /api/nutrition-plans/:id/meals — agregar comida al plan
router.post("/:id/meals", roles("NUTRITIONIST"), async (req, res) => {
  const { type, time } = req.body;
  const meal = await prisma.meal.create({
    data: { type, time, nutritionPlanId: Number(req.params.id) },
  });
  res.status(201).json(meal);
});

// POST /api/nutrition-plans/meals/:mealId/foods — agregar alimento a comida
router.post("/meals/:mealId/foods", roles("NUTRITIONIST"), async (req, res) => {
  const { foodCatalogId, quantity, unit } = req.body;
  const item = await prisma.mealFoodItem.create({
    data: {
      mealId: Number(req.params.mealId),
      foodCatalogId: Number(foodCatalogId),
      quantity: Number(quantity),
      unit: unit || "gramos",
    },
    include: { foodCatalog: true },
  });
  res.status(201).json(item);
});

module.exports = router;
