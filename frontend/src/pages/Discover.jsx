import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/Navbar";

const ROLE_LABELS = { NUTRITIONIST: "Nutricionista", TRAINER: "Entrenador" };
const ROLE_COLORS = {
  NUTRITIONIST: "bg-green-100 text-green-700",
  TRAINER: "bg-blue-100 text-blue-700",
};

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={
            s <= Math.round(value) ? "text-yellow-400" : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function Discover() {
  const [professionals, setProfessionals] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/profiles").then((r) => {
      setProfessionals(r.data);
      setLoading(false);
    });
  }, []);

  const filtered = professionals.filter((p) => {
    const matchRole = filter === "ALL" || p.role === filter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.specialty || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.bio || "").toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Descubrir profesionales
        </h1>
        <p className="text-gray-500 mb-6">
          Conecta con nutricionistas y entrenadores certificados
        </p>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2">
            {["ALL", "NUTRITIONIST", "TRAINER"].map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === r
                    ? "bg-primary text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r === "ALL" ? "Todos" : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No se encontraron profesionales
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/profile/${p.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      p.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {p.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[p.role]}`}
                    >
                      {ROLE_LABELS[p.role]}
                    </span>
                  </div>
                </div>

                {p.specialty && (
                  <p className="text-sm text-gray-500 mb-2">📌 {p.specialty}</p>
                )}
                {p.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {p.bio}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  {p.avgRating ? (
                    <div className="flex items-center gap-1">
                      <StarRating value={p.avgRating} />
                      <span className="text-xs text-gray-400">
                        ({p.totalRatings})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Sin calificaciones
                    </span>
                  )}
                  <span className="text-xs text-primary font-medium">
                    Ver perfil →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
