import '../styles/main.css';

function LoginPage() {
    return (
        <main className="container-login">

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

    );
}

export default LoginPage;
