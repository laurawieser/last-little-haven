import './styles/main.css';

function App() {
  return (
    <main className="app">
      <header>
        <h1>Last Little Haven</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/archive">Archiv</a>
          <a href="/map">Karte</a>
          <a href="/submit">Einreichen</a>
          <a href="/admin">Admin</a>
        </nav>
      </header>

      <section>
        <p>Willkommen bei Last Little Haven. Hier entsteht das Archiv deiner Spaziergänge.</p>
      </section>

      <footer>
        <p>© Last Little Haven</p>
      </footer>
    </main>
  );
}

export default App;
