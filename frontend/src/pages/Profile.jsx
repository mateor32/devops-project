import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
  NUTRITIONIST: "Nutricionista",
  TRAINER: "Entrenador",
  USER: "Usuario",
  ADMIN: "Admin",
};
const ROLE_COLORS = {
  NUTRITIONIST: "bg-green-100 text-green-700",
  TRAINER: "bg-blue-100 text-blue-700",
  USER: "bg-gray-100 text-gray-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={
            s <= (hover || value) ? "text-yellow-400" : "text-gray-300"
          }
        >
          ★
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ value }) {
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

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [connStatus, setConnStatus] = useState(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingMsg, setRatingMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const isOwn = me?.id === parseInt(id);

  const load = () => {
    api.get(`/profiles/${id}`).then((r) => {
      setProfile(r.data);
      setEditData({
        name: r.data.name,
        bio: r.data.bio || "",
        specialty: r.data.specialty || "",
        avatarUrl: r.data.avatarUrl || "",
      });
    });
    if (!isOwn) {
      api.get(`/connections/status/${id}`).then((r) => setConnStatus(r.data));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const sendConnection = async () => {
    await api.post("/connections", { toId: parseInt(id) });
    setConnStatus({ status: "PENDING", direction: "sent" });
  };

  const submitRating = async (e) => {
    e.preventDefault();
    if (!ratingScore) return setRatingMsg("Selecciona una calificación");
    try {
      await api.post("/ratings", {
        toUserId: parseInt(id),
        score: ratingScore,
        comment: ratingComment,
      });
      setRatingMsg("¡Calificación enviada!");
      setRatingScore(0);
      setRatingComment("");
      load();
    } catch (err) {
      setRatingMsg(err.response?.data?.message || "Error");
    }
  };

  const saveEdit = async () => {
    const r = await api.patch("/profiles/me", editData);
    setProfile((p) => ({ ...p, ...r.data }));
    setEditing(false);
  };

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Cargando...
      </div>
    );

  const isProfessional = ["NUTRITIONIST", "TRAINER"].includes(profile.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header del perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary overflow-hidden flex-shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name[0].toUpperCase()
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-2">
                  <input
                    className="w-full border rounded-lg px-3 py-1.5 text-sm"
                    placeholder="Nombre"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, name: e.target.value }))
                    }
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-1.5 text-sm"
                    placeholder="Especialidad"
                    value={editData.specialty}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, specialty: e.target.value }))
                    }
                  />
                  <textarea
                    className="w-full border rounded-lg px-3 py-1.5 text-sm resize-none"
                    rows={3}
                    placeholder="Bio"
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, bio: e.target.value }))
                    }
                  />
                  <input
                    className="w-full border rounded-lg px-3 py-1.5 text-sm"
                    placeholder="URL de foto"
                    value={editData.avatarUrl}
                    onChange={(e) =>
                      setEditData((d) => ({ ...d, avatarUrl: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="border px-4 py-1.5 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {profile.name}
                    </h1>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[profile.role]}`}
                    >
                      {ROLE_LABELS[profile.role]}
                    </span>
                  </div>
                  {profile.specialty && (
                    <p className="text-sm text-gray-500 mb-1">
                      📌 {profile.specialty}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-gray-600 text-sm mb-2">{profile.bio}</p>
                  )}
                  {profile.avgRating && (
                    <div className="flex items-center gap-2">
                      <StarDisplay value={profile.avgRating} />
                      <span className="text-sm text-gray-500">
                        {profile.avgRating.toFixed(1)} (
                        {profile.ratingsReceived.length} reseñas)
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 items-end">
              {isOwn ? (
                <button
                  onClick={() => setEditing(true)}
                  className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Editar perfil
                </button>
              ) : (
                isProfessional && (
                  <button
                    onClick={sendConnection}
                    disabled={!!connStatus?.status}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      connStatus?.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 cursor-default"
                        : connStatus?.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-primary text-white hover:bg-secondary"
                    }`}
                  >
                    {connStatus?.status === "PENDING"
                      ? "⏳ Solicitud enviada"
                      : connStatus?.status === "ACCEPTED"
                        ? "✅ Conectados"
                        : "+ Conectar"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Calificar (solo si es profesional y no es uno mismo) */}
        {!isOwn && isProfessional && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Dejar una reseña
            </h2>
            <form onSubmit={submitRating} className="space-y-3">
              <StarPicker value={ratingScore} onChange={setRatingScore} />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Comentario (opcional)"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
              {ratingMsg && (
                <p className="text-sm text-green-600">{ratingMsg}</p>
              )}
              <button
                type="submit"
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-secondary"
              >
                Enviar reseña
              </button>
            </form>
          </div>
        )}

        {/* Reseñas */}
        {isProfessional && profile.ratingsReceived?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">
              Reseñas ({profile.ratingsReceived.length})
            </h2>
            <div className="space-y-4">
              {profile.ratingsReceived.map((r, i) => (
                <div
                  key={i}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {r.fromUser.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-700 text-sm">
                      {r.fromUser.name}
                    </span>
                    <StarDisplay value={r.score} />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-600 ml-11">{r.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 ml-11 mt-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
