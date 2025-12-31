import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    if (user) {
        navigate(from, { replace: true });
        return null;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        setBusy(false);

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        navigate(from, { replace: true });
    }

    return (
        <main className="container-login">

            <h1>Login</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <label>
                    E-Mail
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>

                <label>
                    Passwort
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>

                {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

                <button type="submit" disabled={busy}>
                    {busy ? "…" : "Login"}
                </button>
            </form>
        </main>

    );
}

export default LoginPage;
