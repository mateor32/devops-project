import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Chat from "../components/Chat";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("nutrition");
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [professional, setProfessional] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/nutrition-plans/mine").catch(() => ({ data: null })),
      api.get("/training-plans/mine").catch(() => ({ data: null })),
      api.get("/professional/mine").catch(() => ({ data: null })),
    ]).then(([n, t, p]) => {
      setNutritionPlan(n.data);
      setTrainingPlan(t.data);
      setProfessional(p.data);
      setLoading(false);
    });
  }, []);

  const tabs = [
    { key: "nutrition", label: "🥗 Plan Nutricional" },
    { key: "training", label: "💪 Plan de Entrenamiento" },
    { key: "chat", label: "💬 Chat" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            Aquí tienes tus planes y comunicación con tus profesionales
          </p>
        </div>

        {professional && (
          <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                {professional.nutritionist?.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-xs text-gray-500">Tu nutricionista</p>
                <p className="font-semibold text-gray-800">
                  {professional.nutritionist?.name || "Sin asignar"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                {professional.trainer?.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-xs text-gray-500">Tu entrenador</p>
                <p className="font-semibold text-gray-800">
                  {professional.trainer?.name || "Sin asignar"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t.key ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-400"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Cargando tu información...
          </div>
        ) : (
          <>
            {tab === "nutrition" && <NutritionTab plan={nutritionPlan} />}
            {tab === "training" && <TrainingTab plan={trainingPlan} />}
            {tab === "chat" && (
              <Chat
                selectedUser={
                  professional?.nutritionist || professional?.trainer
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NutritionTab({ plan }) {
  if (!plan)
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow">
        <p className="text-4xl mb-3">🥗</p>
        <p className="text-gray-500">
          Aún no tienes un plan nutricional asignado.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Tu nutricionista lo creará pronto.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">{plan.title}</h2>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
            {plan.goal?.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {plan.startDate?.slice(0, 10)} → {plan.endDate?.slice(0, 10)}
        </p>
        {plan.dailyCalories && (
          <p className="text-sm text-gray-600 mt-1">
            Meta calórica diaria: <strong>{plan.dailyCalories} kcal</strong>
          </p>
        )}
      </div>

      {plan.meals?.map((meal) => (
        <div key={meal.id} className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{mealIcon(meal.type)}</span>
            <h3 className="font-semibold text-gray-800 capitalize">
              {meal.type.replace("_", " ").toLowerCase()}
            </h3>
            <span className="text-xs text-gray-400 ml-auto">{meal.time}</span>
          </div>
          <div className="space-y-2">
            {meal.mealFoodItems?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">{item.foodCatalog?.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {Math.round(
                      (item.quantity *
                        (item.foodCatalog?.caloriesPer100g || 0)) /
                        100,
                    )}{" "}
                    kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrainingTab({ plan }) {
  if (!plan)
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow">
        <p className="text-4xl mb-3">💪</p>
        <p className="text-gray-500">
          Aún no tienes un plan de entrenamiento asignado.
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Tu entrenador lo creará pronto.
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">{plan.title}</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            {plan.goal?.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {plan.startDate?.slice(0, 10)} → {plan.endDate?.slice(0, 10)}
        </p>
        {plan.daysPerWeek && (
          <p className="text-sm text-gray-600 mt-1">
            {plan.daysPerWeek} días por semana
          </p>
        )}
      </div>

      {plan.trainingDays?.map((day) => (
        <div key={day.id} className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold text-gray-800">{day.dayOfWeek}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {day.muscleGroup}
            </span>
          </div>
          <div className="space-y-3">
            {day.planExercises?.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">
                    {ex.exerciseCatalog?.name}
                  </p>
                  {ex.machineCatalog && (
                    <p className="text-xs text-gray-500">
                      🏋️ {ex.machineCatalog.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 text-sm text-gray-600">
                  <span className="text-center">
                    <strong className="block text-gray-800">{ex.sets}</strong>
                    series
                  </span>
                  <span className="text-center">
                    <strong className="block text-gray-800">{ex.reps}</strong>
                    reps
                  </span>
                  {ex.weight && (
                    <span className="text-center">
                      <strong className="block text-gray-800">
                        {ex.weight}kg
                      </strong>
                      peso
                    </span>
                  )}
                  <span className="text-center">
                    <strong className="block text-gray-800">
                      {ex.restSeconds}s
                    </strong>
                    desc.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function mealIcon(type) {
  const icons = {
    BREAKFAST: "🌅",
    MORNING_SNACK: "🍎",
    LUNCH: "🍽️",
    AFTERNOON_SNACK: "🥪",
    DINNER: "🌙",
  };
  return icons[type] || "🍴";
}
