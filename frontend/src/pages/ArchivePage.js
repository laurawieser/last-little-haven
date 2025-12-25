import '../styles/main.css';

function ArchivePage() {
    return (
        <main className="archive">
            <header>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="archive.html">Archiv</a>
                    <a href="map.html">Karte</a>
                    <a href="submit.html">Einreichen</a>
                </nav>
            </header>

            <main class="container">
                <h1>Archiv</h1>

                <section class="archive-list">
                    <div class="card">Archiv-Eintrag 1</div>
                    <div class="card">Archiv-Eintrag 2</div>
                    <div class="card">Archiv-Eintrag 3</div>
                </section>
            </main>

            <footer>
                <p>© Last Little Haven</p>
            </footer>

        </main>
    );
}

export default ArchivePage;
