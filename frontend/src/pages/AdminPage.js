import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");


  async function loadPending() {
    const { data, error } = await supabase
      .from("archive_entries")
      .select("id,title,type,created_at,created_by,status")
      .eq("status", "SUBMITTED")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadPending error:", error);
      setError(error.message);
      setPending([]);
    } else {
      setPending(data ?? []);
    }

    setLoading(false);
  }

  async function checkAdminAndLoad() {
    setLoading(true);
    setError("");

    // 1) Get logged-in user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (authError || !userId) {
      setError("Please log in as admin.");
      setPending([]);
      setLoading(false);
      return;
    }

    // 2) Check role in "profiles" table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || profile?.role !== "ADMIN") {
      setError("No admin access.");
      setPending([]);
      setLoading(false);
      return;
    }

    // 3) Admin ok → load submissions
    await loadPending();
    setLoading(false);
  }

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function setStatus(entryId, status) {
    setBusyId(entryId);
    setError("");

    const { error } = await supabase
      .from("archive_entries")
      .update({ status })
      .eq("id", entryId);

    if (error) {
      console.error("setStatus error:", error);
      setError(error.message);
    } else {
      // remove from list immediately
      setPending((prev) => prev.filter((e) => e.id !== entryId));
    }

    setBusyId(null);
  }

  async function deleteEntry(entryId) {
    setBusyId(entryId);
    setError("");

    const { error } = await supabase
      .from("archive_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      console.error("deleteEntry error:", error);
      setError(error.message);
    } else {
      setPending((prev) => prev.filter((e) => e.id !== entryId));
    }

    setBusyId(null);
  }

  return (
    <main className="container-admin">
      <h1>Moderation</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <p>No open submissions.</p>
      ) : (
        <section style={{ display: "grid", gap: 12 }}>
          {pending.map((e) => (
            <div key={e.id} className="card" style={{ display: "grid", gap: 8 }}>
              <div>
                <strong>{e.title}</strong>
                <div style={{ opacity: 0.8 }}>{e.type}</div>
                <div style={{ opacity: 0.6, fontSize: 12 }}>
                  {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  disabled={busyId === e.id}
                  onClick={() => setStatus(e.id, "APPROVED")}
                >
                  ✅ Approve
                </button>

                <button
                  disabled={busyId === e.id}
                  onClick={() => setStatus(e.id, "DECLINED")}
                >
                  ❌ Decline
                </button>

                <button
                  disabled={busyId === e.id}
                  onClick={() => deleteEntry(e.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminPage;
