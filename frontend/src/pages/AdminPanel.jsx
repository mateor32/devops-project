import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../lib/api";

export default function AdminPanel() {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        api.get("/admin/pending"),
        api.get("/admin/approved"),
      ]);
      setPending(p.data);
      setApproved(a.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/approve/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/admin/reject/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const roleLabel = (role) =>
    role === "NUTRITIONIST" ? "🥗 Nutricionista" : "💪 Entrenador";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Panel de Administrador
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-amber-400">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-3xl font-bold text-amber-500">
              {pending.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
            <p className="text-sm text-gray-500">Aprobados</p>
            <p className="text-3xl font-bold text-green-600">
              {approved.length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-400">
            <p className="text-sm text-gray-500">Total profesionales</p>
            <p className="text-3xl font-bold text-blue-500">
              {pending.length + approved.length}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {["pending", "approved"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:border-green-400"}`}
            >
              {t === "pending"
                ? `Pendientes (${pending.length})`
                : `Aprobados (${approved.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando...</div>
        ) : (
          <div className="space-y-3">
            {(tab === "pending" ? pending : approved).map((pro) => (
              <div
                key={pro.id}
                className="bg-white rounded-xl shadow p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{pro.name}</p>
                  <p className="text-sm text-gray-500">{pro.email}</p>
                  <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {roleLabel(pro.role)}
                  </span>
                </div>
                {tab === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(pro.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(pro.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-lg border border-red-200 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
                {tab === "approved" && (
                  <span className="text-green-600 text-sm font-semibold">
                    ✓ Activo
                  </span>
                )}
              </div>
            ))}
            {(tab === "pending" ? pending : approved).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No hay registros aquí.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
