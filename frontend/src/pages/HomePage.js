import '../styles/main.css';

function HomePage() {
  return (
    <main className="home">
      <header>
        <nav>
          <a href="index.html">Home</a>
          <a href="archive.html">Archiv</a>
          <a href="map.html">Karte</a>
          <a href="submit.html">Einreichen</a>
          <a href="login.html">Login</a>
        </nav>
      </header>

      <main class="container">
        <h1>Last Little Haven</h1>
        <p>
          About us
        </p>
      </main>

      <footer>
        <p>© Last Little Haven</p>
      </footer>

    </main>
  );
}

export default HomePage;
