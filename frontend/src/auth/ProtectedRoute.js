import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 🔍 DEBUG-LOGS
    console.log("ProtectedRoute → loading:", loading);
    console.log("ProtectedRoute → user:", user);

    if (loading) return <div style={{ padding: 16 }}>Lade…</div>;

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}
