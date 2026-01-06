import { 
  BrowserRouter, 
  Routes, 
  Route, 
  NavLink 
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import MapPage from './pages/MapPage';
import SubmitPage from './pages/SubmitPage';
import AdminPage from './pages/AdminPage';
import LoginPage from "./pages/LoginPage";
import DetailPage from './pages/DetailPage';

import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";



function App() {
  const { user, signOut } = useAuth();

  return (
    <main className="app">
      <header>
        <h1>Last Little Haven</h1>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/archive">Archive</NavLink>
          <NavLink to="/map">Map</NavLink>

          {user && <NavLink to="/submit">Einreichen</NavLink>}
          {user && <NavLink to="/admin">Admin</NavLink>}

          {!user ? (
            <NavLink to="/login">Login</NavLink>
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

          <Route path="/archive/:id" element={<DetailPage />} />

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
