import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl mb-4">🚫</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso denegado
        </h1>
        <p className="text-gray-500 mb-6">
          No tienes permiso para ver esta página.
        </p>
        <Link
          to="/login"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
