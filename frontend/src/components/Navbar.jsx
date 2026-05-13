import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardLink = () => {
    if (user?.role === "ADMIN") return "/admin";
    if (user?.role === "NUTRITIONIST") return "/professional";
    if (user?.role === "TRAINER") return "/professional";
    return "/dashboard";
  };

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={dashboardLink()} className="text-xl font-bold tracking-tight">
          🥗 NutriGym
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/discover"
              className="text-sm text-green-200 hover:text-white transition"
            >
              Descubrir
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="text-sm text-green-200 hover:text-white transition"
            >
              Mi perfil
            </Link>
            <span className="text-sm opacity-80">
              {user.name} &bull;{" "}
              <span className="capitalize text-green-200 text-xs font-semibold">
                {user.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded hover:bg-green-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
