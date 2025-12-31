import './styles/main.css';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import MapPage from './pages/MapPage';
import SubmitPage from './pages/SubmitPage';
import AdminPage from './pages/AdminPage';
import LoginPage from "./pages/LoginPage";

import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { user, signOut } = useAuth();

  return (
    <main className="app">
      <header>
        <h1>Last Little Haven</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/archive">Archive</Link>
          <Link to="/map">Map</Link>

          {user && <Link to="/submit">Einreichen</Link>}
          {user && <Link to="/admin">Admin</Link>}

          {!user ? (
            <Link to="/login">Login</Link>
          ) : (
            <button type="button" onClick={() => signOut()} style={{ marginLeft: 8 }}>
              Logout
            </button>
          )}
        </nav>
      </header>

      <section>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/map" element={<MapPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </section>

      <footer>
        <p>© Last Little Haven</p>
      </footer>
    </main>
  );
}

export default App;
