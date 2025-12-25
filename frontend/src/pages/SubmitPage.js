import '../styles/main.css';

function SubmitPage() {
    return (
        <main className="submit">
            <header>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="archive.html">Archiv</a>
                    <a href="submit.html">Einreichen</a>
                </nav>
            </header>

            <main class="container">
                <h1>Neuen Ort einreichen</h1>

                <form>
                    <label>
                        Titel
                        <input type="text" />
                    </label>

                    <label>
                        Beschreibung
                        <textarea></textarea>
                    </label>

                    <button type="submit">Absenden</button>
                </form>
            </main>

            <footer>
                <p>© Last Little Haven</p>
            </footer>
            
        </main>
    );
}

export default SubmitPage;
