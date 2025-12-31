import '../styles/main.css';

function SubmitPage() {
    return (
        <main className="container-submit">
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
    );
}

export default SubmitPage;
