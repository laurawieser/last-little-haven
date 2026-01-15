import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

const TYPE_OPTIONS = [
  { value: "Space", label: "Space" },
  { value: "Artifact", label: "Artifact" },
  { value: "Photography", label: "Photography" },
];

export default function MySubmissionsPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadMine() {
    if (!user) return;

    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("archive_entries")
      .select("id,title,description,type,image_url,status,created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setRows([]);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMine();
  }, [user?.id]);

  function startEdit(row) {
    setEditingId(row.id);
    setTitle(row.title ?? "");
    setDescription(row.description ?? "");
    setType(row.type ?? "");
    setImageUrl(row.image_url ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setType("");
    setImageUrl("");
  }

  async function saveEdit() {
    if (!user || !editingId) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type: type.trim(),
      image_url: imageUrl.trim() || null,
      status: "SUBMITTED",
    };

    if (!payload.title || !payload.description || !payload.type) {
      setErrorMsg("Please provide title, description and type.");
      return;
    }

    setBusy(true);
    setErrorMsg("");

    const { error } = await supabase
      .from("archive_entries")
      .update(payload)
      .eq("id", editingId);

    setBusy(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.id === editingId ? { ...r, ...payload } : r))
    );
    cancelEdit();
  }

  if (!user) return <div>Please log in.</div>;
  if (loading) return <div>Loading submissions…</div>;

  return (
    <main className="container-submissions">
      <h1>My Submissions</h1>

      {errorMsg && <p className="submissions-error">{errorMsg}</p>}

      {rows.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <section className="submissions-list">
          {rows.map((row) => {
            const isEditing = editingId === row.id;

            return (
              <article key={row.id} className="submission-card">
                <header className="submission-head">
                  <div className="submission-head-left">
                    <div className="submission-title">
                      {row.title || "(no title)"}
                      <span className="submission-status">
                        {String(row.status || "").toUpperCase()}
                      </span>
                    </div>
                    <div className="submission-type">
                      Type: {(row.type || "ORT").toUpperCase()}
                    </div>
                  </div>

                  <div className="submission-head-right">
                    {!isEditing ? (
                      <button type="button" onClick={() => startEdit(row)}>
                        Edit
                      </button>
                    ) : (
                      <button type="button" onClick={cancelEdit} disabled={busy}>
                        Cancel
                      </button>
                    )}
                  </div>
                </header>

                {!isEditing ? (
                  <div className="submission-body">
                    {row.description}
                  </div>
                ) : (
                  <div className="submission-edit">
                    <label className="submission-field">
                      Title
                      <input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </label>

                    <label className="submission-field">
                      Description
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                      />
                    </label>

                    <label className="submission-field">
                      Type
                      <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">Select…</option>
                        {TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="submission-field">
                      Image URL (optional)
                      <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        type="url"
                      />
                    </label>

                    <div className="submission-actions">
                      <button type="button" onClick={saveEdit} disabled={busy}>
                        {busy ? "…" : "Save (re-submit)"}
                      </button>
                      <button type="button" onClick={cancelEdit} disabled={busy}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
