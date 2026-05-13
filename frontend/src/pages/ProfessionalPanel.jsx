import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import Chat from "../components/Chat";

export default function ProfessionalPanel() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tab, setTab] = useState("clients");
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    api
      .get("/professional/clients")
      .then((res) => {
        setClients(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {user?.role === "NUTRITIONIST"
                ? "🥗 Panel Nutricionista"
                : "💪 Panel Entrenador"}
            </h1>
            <p className="text-gray-500 text-sm">
              Gestiona tus clientes y planes
            </p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            + Crear plan
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {["clients", "plans", "chat"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${tab === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-400"}`}
            >
              {t === "clients"
                ? "👥 Clientes"
                : t === "plans"
                  ? "📋 Planes"
                  : "💬 Chat"}
            </button>
          ))}
        </div>

        {tab === "clients" && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Cargando clientes...
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Aún no tienes clientes asignados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl shadow p-5 border hover:border-green-400 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                        {c.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(c);
                          setTab("chat");
                        }}
                        className="flex-1 text-sm border border-green-500 text-green-600 rounded-lg py-1.5 hover:bg-green-50 transition"
                      >
                        💬 Chat
                      </button>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex-1 text-sm bg-green-600 text-white rounded-lg py-1.5 hover:bg-green-700 transition"
                      >
                        + Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "plans" && <PlansTab role={user?.role} clients={clients} />}
        {tab === "chat" && <Chat selectedUser={selectedClient} />}
      </div>

      {showAssignModal && (
        <CreatePlanModal
          clients={clients}
          role={user?.role}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
}

function PlansTab({ role, clients }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint =
      role === "NUTRITIONIST" ? "/nutrition-plans/my" : "/training-plans/my";
    api
      .get(endpoint)
      .then((res) => {
        setPlans(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [role]);

  if (loading)
    return (
      <div className="text-center py-12 text-gray-400">Cargando planes...</div>
    );
  if (plans.length === 0)
    return (
      <div className="text-center py-12 text-gray-400">
        No has creado planes aún.
      </div>
    );

  return (
    <div className="space-y-3">
      {plans.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-gray-800">{p.title}</p>
            <p className="text-sm text-gray-500">
              Cliente: {p.user?.name} &bull; Meta: {p.goal}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {p.startDate?.slice(0, 10)} → {p.endDate?.slice(0, 10)}
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            {p.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CreatePlanModal({ clients, role, onClose }) {
  const [form, setForm] = useState({
    userId: "",
    title: "",
    goal: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        role === "NUTRITIONIST" ? "/nutrition-plans" : "/training-plans";
      await api.post(endpoint, form);
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goals =
    role === "NUTRITIONIST"
      ? ["WEIGHT_LOSS", "MUSCLE_GAIN", "MAINTENANCE", "HEALTH"]
      : ["HYPERTROPHY", "STRENGTH", "ENDURANCE", "WEIGHT_LOSS", "FLEXIBILITY"];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Crear nuevo plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 text-green-600 font-semibold">
            ✓ Plan creado exitosamente
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Selecciona un cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del plan
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ej: Fase de volumen - Semana 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objetivo
              </label>
              <select
                name="goal"
                value={form.goal}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Selecciona un objetivo</option>
                {goals.map((g) => (
                  <option key={g} value={g}>
                    {g.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear plan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
