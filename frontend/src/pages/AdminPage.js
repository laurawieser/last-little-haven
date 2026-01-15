import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    type: "",
    image_url: "",
    status: "SUBMITTED",
  });


  async function loadPending() {
    const { data, error } = await supabase
      .from("archive_entries")
      .select("id,title,description,type,image_url,created_at,created_by,status,image_url")
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

  function startEdit(entry) {
    setEditingId(entry.id);
    setDraft({
      title: entry.title ?? "",
      description: entry.description ?? "",
      type: entry.type ?? "",
      image_url: entry.image_url ?? "",
      status: entry.status ?? "SUBMITTED",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(entryId) {
    setBusyId(entryId);
    setError("");

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      type: draft.type.trim(),
      image_url: draft.image_url.trim() || null,
      status: draft.status,
    };

    const { error } = await supabase
      .from("archive_entries")
      .update(payload)
      .eq("id", entryId);

    if (error) {
      console.error("saveEdit error:", error);
      setError(error.message);
      setBusyId(null);
      return;
    }

    // UI aktualisieren (ohne neu laden)
    if (payload.status !== "SUBMITTED") {
      setPending((prev) => prev.filter((x) => x.id !== entryId));
    } else {
      setPending((prev) =>
        prev.map((x) => (x.id === entryId ? { ...x, ...payload } : x))
      );
    }

    setEditingId(null);
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
              {/* Thumbnail */}
              {e.image_url ? (
                <img
                  src={e.image_url}
                  alt={e.title || "Submission image"}
                  style={{
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                  loading="lazy"
                  onError={(ev) => {
                    ev.currentTarget.style.display = "none";
                  }}
                />
              ) : null}


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
                  onClick={() => startEdit(e)}
                >
                  ✏️ Edit
                </button>

                <button
                  disabled={busyId === e.id}
                  onClick={() => deleteEntry(e.id)}
                >
                  🗑 Delete
                </button>
              </div>
              {editingId === e.id && (
                <div className="card" style={{ padding: 12, display: "grid", gap: 8 }}>
                  <label>
                    Title
                    <input
                      value={draft.title}
                      onChange={(ev) => setDraft((d) => ({ ...d, title: ev.target.value }))}
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={draft.description}
                      onChange={(ev) =>
                        setDraft((d) => ({ ...d, description: ev.target.value }))
                      }
                      rows={4}
                    />
                  </label>

                  <label>
                    Type
                    <select
                      value={draft.type}
                      onChange={(ev) =>
                        setDraft((d) => ({ ...d, type: ev.target.value }))
                      }
                    >
                      <option value="photography">Photography</option>
                      <option value="artifact">Artifact</option>
                      <option value="space">Space</option>
                    </select>
                  </label>

                  <label>
                    Image URL
                    <input
                      value={draft.image_url}
                      onChange={(ev) =>
                        setDraft((d) => ({ ...d, image_url: ev.target.value }))
                      }
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={draft.status}
                      onChange={(ev) =>
                        setDraft((d) => ({ ...d, status: ev.target.value }))
                      }
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="APPROVED">Approved</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </label>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      disabled={busyId === e.id}
                      onClick={() => saveEdit(e.id)}
                    >
                      💾 Save
                    </button>

                    <button disabled={busyId === e.id} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default AdminPage;
