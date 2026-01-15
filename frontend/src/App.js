import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import MapPage from './pages/MapPage';
import SubmitPage from './pages/SubmitPage';
import AdminPage from './pages/AdminPage';
import LoginPage from "./pages/LoginPage";
import DetailPage from './pages/DetailPage';
import AccountPage from "./pages/AccountPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import FavoritesPage from "./pages/FavoritesPage";

import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";



function App() {

  const { user, role, signOut } = useAuth();

  return (
    <main className="app">
      <header>
        <h1>Last Little Haven</h1>
        <nav className="main-nav">
          <div className="nav-left">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/archive">Archive</NavLink>
            <NavLink to="/map">Map</NavLink>

            {user && <NavLink to="/submit">Submit</NavLink>}
            {user && role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
          </div>

          <div className="nav-right">
            {!user ? (
              <NavLink to="/login">Login</NavLink>
            ) : (
              <>
                <NavLink to="/account" className="nav-account">Account</NavLink>
                <button type="button" onClick={() => signOut()} className="nav-logout">
                  Logout
                </button>
              </>
            )}
          </div>
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
              <ProtectedRoute requireRole="ADMIN">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="favorites" replace />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="submissions" element={<MySubmissionsPage />} />
          </Route>

        </Routes>
      </section>

      <footer>
        <p>© Last Little Haven</p>
      </footer>
    </main>
  );
}

export default App;
