import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [infoMsg, setInfoMsg] = useState("");

    if (user) {
        navigate(from, { replace: true });
        return null;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");
        setInfoMsg("");

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            setBusy(false);

            if (error) return setErrorMsg(error.message);
            navigate(from, { replace: true });
            return;
        }

        // signup
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            // optional: zusätzliche Infos speichern (kommt in user_metadata an)
            options: {
                data: { signup_source: "webapp" },
            },
        });

        setBusy(false);

        if (error) {
            setErrorMsg(error.message);
            return;
        }


        // Wenn Email confirmation an ist, ist session oft null und user muss Mail klicken
        if (!data?.session) {
            setInfoMsg("Almost done: Please check your emails to verify your account.");
            return;
        }

        // Wenn confirmation aus ist: direkt eingeloggt
        navigate(from, { replace: true });
    }

    return (
        <main className="container-login">

            <h1>{mode === "login" ? "Login" : "Register"}</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <label>
                    E-Mail
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />
                </label>

                {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
                {infoMsg && <p style={{ color: "green" }}>{infoMsg}</p>}

                <button type="submit" disabled={busy}>
                    {busy ? "…" : mode === "login" ? "Login" : "Create Account"}
                </button>
            </form>

            <Link to="/forgot-password">Forgot password?</Link>

            <p style={{ marginTop: 12 }}>
                {mode === "login" ? (
                    <>
                        No account yet?{" "}
                        <button type="button" onClick={() => setMode("signup")}>
                            Register
                        </button>
                    </>
                ) : (
                    <>
                        Already registered?{" "}
                        <button type="button" onClick={() => setMode("login")}>
                            Go to login
                        </button>
                    </>
                )}
            </p>
        </main>

    );
}

export default LoginPage;
