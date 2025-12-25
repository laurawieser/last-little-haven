import '../styles/main.css';

function AdminPage() {
    return (
        <main className="admin">
            <header>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="admin.html">Admin</a>
                </nav>
            </header>

            <main class="container">
                <h1>Moderation</h1>

                <div class="card">
                    Einreichung wartet auf Freigabe
                </div>
            </main>

            <footer>
                <p>© Last Little Haven</p>
            </footer>
        </main>
    );
}

export default AdminPage;
