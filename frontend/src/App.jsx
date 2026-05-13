import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import ProfessionalPanel from "./pages/ProfessionalPanel";
import UserDashboard from "./pages/UserDashboard";
import Unauthorized from "./pages/Unauthorized";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Perfil público — cualquier usuario autenticado */}
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute
                roles={["ADMIN", "NUTRITIONIST", "TRAINER", "USER"]}
              >
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Discover — explorar profesionales */}
          <Route
            path="/discover"
            element={
              <PrivateRoute
                roles={["ADMIN", "NUTRITIONIST", "TRAINER", "USER"]}
              >
                <Discover />
              </PrivateRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["ADMIN"]}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          {/* Nutricionista y Entrenador */}
          <Route
            path="/professional"
            element={
              <PrivateRoute roles={["NUTRITIONIST", "TRAINER"]}>
                <ProfessionalPanel />
              </PrivateRoute>
            }
          />

          {/* Usuario normal */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={["USER"]}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* Raíz → redirige al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
