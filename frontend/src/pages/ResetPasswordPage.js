import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // When user clicks the recovery email link, Supabase emits PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Also allow direct render if session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
    });

    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.updateUser({ password });

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <main className="container-login">
      <h1>Set new password</h1>

      {!ready ? (
        <p>Open the reset link from your email to continue.</p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}

          <button type="submit" disabled={busy}>
            {busy ? "…" : "Update password"}
          </button>
        </form>
      )}
    </main>
  );
}
