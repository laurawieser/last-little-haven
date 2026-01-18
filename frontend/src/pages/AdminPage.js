import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import { useLookup } from "../hooks/useLookup";
import { roundMb } from "../lib/media";
import { updateArchiveEntry } from "../lib/archiveEntries";

import EntryFieldsSection from "../components/EntryFieldsSection";
import LocationSection from "../components/LocationSection";
import AuthorSection from "../components/AuthorSection";
import MediaSection from "../components/MediaSection";

function getCoverUrl(entry) {
  const media = Array.isArray(entry?.media_files) ? entry.media_files : [];

  const cover =
    media.find((m) => m.role === "COVER") ||
    media[0]; // fallback: erstes Medium

  return cover?.file_url || entry?.image_url || null;
}

function AdminPage() {
  const INITIAL_FORM = {
    title: "",
    description: "",
    type: "",
    imageUrl: "",
    keywordsRaw: "",
    origin_date: "",
    external_links_raw: "",
    status: "SUBMITTED",
    media_files: null,
  };

  const [form, setForm] = useState(INITIAL_FORM);

  const [showAuthor, setShowAuthor] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  const [author, setAuthor] = useState(null);
  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "", birth_date: "", death_date: "" });
  const authorLookup = useLookup({ table: "authors", select: "id,name" });

  const [location, setLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({ name: "", city: "", address: "" });
  const locLookup = useLookup({ table: "locations", select: "id,name,city,address" });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaCredits, setMediaCredits] = useState("");

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  async function loadPending() {
    const { data, error } = await supabase
      .from("archive_entries")
      .select(`
        id,title,description,type,image_url,created_at,created_by,status,
        keywords,origin_date,external_links,author_id,location_id,
        media_files ( id, file_url, role, credits )
      `)
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

  async function startEdit(entry) {
    setEditingId(entry.id);

    setForm({
      title: entry.title ?? "",
      description: entry.description ?? "",
      type: entry.type ?? "",
      imageUrl: "",
      keywordsRaw: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "",
      origin_date: entry.origin_date ?? "",
      external_links_raw: Array.isArray(entry.external_links) ? entry.external_links.join(", ") : "",
      status: entry.status ?? "SUBMITTED",
      media_files: entry.media_files ?? null,
    });

    // Prefill author chip
    if (entry.author_id) {
      const { data } = await supabase
        .from("authors")
        .select("id,name")
        .eq("id", entry.author_id)
        .single();
      if (data) {
        setAuthor(data);
        setShowAuthor(true); // optional: automatisch aufklappen
      }
    } else {
      setAuthor(null);
      setNewAuthor({ name: "", bio: "", birth_date: "", death_date: "" });
      setShowAuthor(false);
    }

    // Prefill location chip
    if (entry.location_id) {
      const { data } = await supabase
        .from("locations")
        .select("id,name,city,address")
        .eq("id", entry.location_id)
        .single();
      if (data) {
        setLocation(data);
        setShowLocation(true); // optional
      }
    } else {
      setLocation(null);
      setNewLocation({ name: "", city: "", address: "" });
      setShowLocation(false);
    }

    setMediaFile(null);
    setMediaCredits("");
    setShowMedia(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(entryId) {
    setBusyId(entryId);
    setError("");

    try {
      const updated = await updateArchiveEntry({
        entryId,
        form,
        authorState: { show: showAuthor, author, newAuthor },
        locationState: { show: showLocation, location, newLocation },
        mediaState: { show: showMedia, file: mediaFile, credits: mediaCredits },
      });

      // UI updaten
      if (updated.status !== "SUBMITTED") {
        setPending((prev) => prev.filter((x) => x.id !== entryId));
      } else {
        setPending((prev) =>
          prev.map((x) => (x.id === entryId ? { ...x, ...updated } : x))
        );
      }

      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Save failed.");
    } finally {
      setBusyId(null);
    }
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
          {pending.map((e) => {
            const coverUrl = getCoverUrl(e);

            return (
              <div key={e.id} className="card" style={{ display: "grid", gap: 8 }}>

                {/* Thumbnail */}
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={e.title || "Submission image"}
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                    loading="lazy"
                    onError={(ev) => {
                      console.log("IMG ERROR", { entryId: e.id, coverUrl });
                      //ev.currentTarget.style.display = "none";
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
                    <EntryFieldsSection form={form} setForm={setForm} />

                    <label>
                      Status
                      <select
                        value={form.status}
                        onChange={(ev) =>
                          setForm((p) => ({ ...p, status: ev.target.value }))
                        }
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="APPROVED">Approved</option>
                        <option value="DECLINED">Declined</option>
                      </select>
                    </label>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" onClick={() => setShowAuthor(v => !v)}>+ Author</button>
                      <button type="button" onClick={() => setShowLocation(v => !v)}>+ Location</button>
                      <button type="button" onClick={() => setShowMedia(v => !v)}>+ Media</button>
                    </div>

                    <LocationSection
                      open={showLocation}
                      location={location}
                      setLocation={setLocation}
                      lookup={locLookup}
                      newLocation={newLocation}
                      setNewLocation={setNewLocation}
                    />

                    <AuthorSection
                      open={showAuthor}
                      author={author}
                      setAuthor={setAuthor}
                      lookup={authorLookup}
                      newAuthor={newAuthor}
                      setNewAuthor={setNewAuthor}
                    />

                    <MediaSection
                      open={showMedia}
                      mediaFile={mediaFile}
                      setMediaFile={setMediaFile}
                      mediaCredits={mediaCredits}
                      setMediaCredits={setMediaCredits}
                      roundMb={roundMb}
                    />

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
            )
          })}
        </section>
      )}
    </main>
  );
}

export default AdminPage;
