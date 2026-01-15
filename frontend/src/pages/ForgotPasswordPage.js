import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const value = email.trim();
    if (!value) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setBusy(true);

    const redirectTo = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(value, {
      redirectTo,
    });

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Password reset email sent. Please check your inbox.");
    setEmail("");
  }

  return (
    <main className="container-login">
      <h1>Reset password</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

        <button type="submit" disabled={busy}>
          {busy ? "…" : "Send reset link"}
        </button>
      </form>
    </main>
  );
}
