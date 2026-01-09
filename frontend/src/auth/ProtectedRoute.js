import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, requireRole }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 16 }}>Lade…</div>;
  }

  // Not logged in → login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role → block
  if (requireRole && role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
