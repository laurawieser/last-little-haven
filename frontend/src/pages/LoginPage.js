import '../styles/main.css';

function LoginPage() {
    return (
        <main className="login">
            <header>
                <nav>
                    <a href="index.html">Home</a>
                    <a href="login.html">Login</a>
                </nav>
            </header>

            <main class="container">
                <h1>Login</h1>

                <form>
                    <label>
                        E-Mail
                        <input type="email" />
                    </label>

                    <label>
                        Passwort
                        <input type="password" />
                    </label>

                    <button type="submit">Login</button>
                </form>
            </main>

            <footer>
                <p>© Last Little Haven</p>
            </footer>

        </main>
    );
}

export default LoginPage;
