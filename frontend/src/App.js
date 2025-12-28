import './styles/main.css';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import MapPage from './pages/MapPage';
import SubmitPage from './pages/SubmitPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <main className="app">
      <header>
        <h1>Last Little Haven</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/archive">Archiv</Link>
          <Link to="/map">Karte</Link>
          <Link to="/submit">Einreichen</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </header>

      <section>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </section>

      <footer>
        <p>© Last Little Haven</p>
      </footer>
    </main>
  );
}

export default App;
