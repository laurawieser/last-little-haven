import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

const TYPE_OPTIONS = [
    { value: "", label: "Select type…" },
    { value: "Space", label: "Space" },
    { value: "Artifact", label: "Artifact" },
    { value: "Photography", label: "Photography" },
];

// Helpers
function parseCommaList(s) {
    return (s || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
}

function roundMb(bytes) {
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

function SubmitPage() {
    const { user } = useAuth();

    // Entry fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [keywordsRaw, setKeywordsRaw] = useState("");
    const [originDate, setOriginDate] = useState(""); // YYYY-MM-DD
    const [externalLinksRaw, setExternalLinksRaw] = useState("");

    // UI state
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showAuthor, setShowAuthor] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showMedia, setShowMedia] = useState(false);

    // Author select + create
    const [author, setAuthor] = useState(null);
    const [authorQ, setAuthorQ] = useState("");
    const [authorSug, setAuthorSug] = useState([]);
    const [authorOpen, setAuthorOpen] = useState(false);


    const [newAuthor, setNewAuthor] = useState({
        name: "",
        bio: "",
        birth_date: "",
        death_date: "",
    });

    // Location select + create
    const [location, setLocation] = useState(null);   // {id,name} | null
    const [locQ, setLocQ] = useState("");
    const [locSug, setLocSug] = useState([]);
    const [locOpen, setLocOpen] = useState(false);

    const [newLocation, setNewLocation] = useState({
        name: "",
        city: "",
        address: "",
    });

    // Media
    const [mediaFile, setMediaFile] = useState(null); // File|null
    const [mediaCredits, setMediaCredits] = useState("");

    // --- Autocomplete: locations ---
    useEffect(() => {
        let ignore = false;
        async function run() {
            if (!locQ.trim()) { setLocSug([]); return; }
            const { data, error } = await supabase
                .from("locations")
                .select("id,name,city,address")
                .ilike("name", `%${locQ}%`)
                .order("name")
                .limit(8);
            if (!ignore) setLocSug(error ? [] : data ?? []);
        }
        run();
        return () => { ignore = true; };
    }, [locQ]);

    // --- Autocomplete: authors ---
    useEffect(() => {
        let ignore = false;
        async function run() {
            if (!authorQ.trim()) { setAuthorSug([]); return; }
            const { data, error } = await supabase
                .from("authors")
                .select("id,name")
                .ilike("name", `%${authorQ}%`)
                .order("name")
                .limit(8);
            if (!ignore) setAuthorSug(error ? [] : data ?? []);
        }
        run();
        return () => { ignore = true; };
    }, [authorQ]);

    // --- Media file upload ---
    async function uploadToStorage(file) {
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
        const path = `entries/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
            .from("media_archive")
            .upload(path, file, { upsert: false });

        if (upErr) throw upErr;

        const { data } = supabase.storage.from("media").getPublicUrl(path);
        return data.publicUrl;
    }

    async function insertMediaRow(file, fileUrl, credits) {
        const { data, error } = await supabase
            .from("media_files")
            .insert({
                file_name: file.name,
                file_type: file.type || "unknown",
                file_url: fileUrl,
                file_size_mb: roundMb(file.size),
                credits: credits.trim() || null,
            })
            .select("id")
            .single();

        if (error) throw error;
        return data.id;
    }

    async function ensureAuthorId() {
        // existing selected
        if (author?.id) return author.id;

        // create new if filled
        const name = newAuthor.name.trim();
        if (!name) return null;

        const { data, error } = await supabase
            .from("authors")
            .insert({
                name,
                bio: newAuthor.bio.trim() || null,
                birth_date: newAuthor.birth_date || null,
                death_date: newAuthor.death_date || null,
            })
            .select("id")
            .single();

        if (error) throw error;
        return data.id;
    }

    async function ensureLocationId() {
        // existing selected
        if (location?.id) return location.id;

        // create new if filled
        const name = newLocation.name.trim();
        if (!name) return null;

        const { data, error } = await supabase
            .from("locations")
            .insert({
                name,
                city: newLocation.city.trim() || null,
                address: newLocation.address.trim() || null,
            })
            .select("id,name")
            .single();

        if (error) throw error;
        return data.id;
    }

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            if (!user) {
                setErrorMsg("Not logged in.");
                setBusy(false);
                return;
            }

            const keywords = parseCommaList(keywordsRaw);
            const external_links = parseCommaList(externalLinksRaw);

            // Minimal validation
            if (!title.trim() || !description.trim() || !type.trim()) {
                setErrorMsg("Please fill out title, description and type");
                setBusy(false);
                return;
            }

            // 1) optional: create/resolve author + location
            const author_id = showAuthor ? await ensureAuthorId() : null;
            const location_id = showLocation ? await ensureLocationId() : null;

            // 2) optional: upload media + create media_files row
            let media_file_id = null;
            if (showMedia && mediaFile) {
                const fileUrl = await uploadToStorage(mediaFile);
                media_file_id = await insertMediaRow(mediaFile, fileUrl, mediaCredits);
            }

            // 3) insert entry
            const payload = {
                title: title.trim(),
                description: description.trim(),
                type: type.trim(),
                image_url: imageUrl.trim() || null,

                keywords,
                origin_date: originDate || null,
                external_links,

                created_by: user.id,
                status: "SUBMITTED",

                author_id,
                location_id,
                media_file_id,
            };

            const { error } = await supabase.from("archive_entries").insert(payload);

            if (error) {
                console.error("insert error:", error);
                setErrorMsg(error.message);
                return;
            }

            setSuccessMsg("Thank you! Your submission has been saved.");

            // reset
            setTitle("");
            setDescription("");
            setType("");
            setImageUrl("");
            setKeywordsRaw("");
            setOriginDate("");
            setExternalLinksRaw("");

            setAuthor(null);
            setAuthorQ("");
            setAuthorSug([]);
            setNewAuthor({ name: "", bio: "", birth_date: "", death_date: "" });

            setLocation(null);
            setLocQ("");
            setLocSug([]);
            setNewLocation({ name: "", city: "", address: "" });

            setMediaFile(null);
            setMediaCredits("");

            setShowAuthor(false);
            setShowLocation(false);
            setShowMedia(false);
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.message || "Something went wrong.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="container submit">
            <h1>Submit new entry</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
                <label>
                    Title
                    <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
                </label>

                <label>
                    Description
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>

                <label>
                    Type
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Keywords (comma separated)
                    <input
                        value={keywordsRaw}
                        onChange={(e) => setKeywordsRaw(e.target.value)}
                        placeholder="flyer, punk, 2000s"
                    />
                </label>

                <label>
                    Origin date
                    <input type="date" value={originDate} onChange={(e) => setOriginDate(e.target.value)} />
                </label>

                <label>
                    External links (comma separated)
                    <input
                        value={externalLinksRaw}
                        onChange={(e) => setExternalLinksRaw(e.target.value)}
                        placeholder="https://…, https://…"
                    />
                </label>

                <label>
                    Image URL (optional)
                    <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        type="url"
                        placeholder="https://picsum.photos/300/200"
                    />
                </label>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setShowAuthor(v => !v)}>+ Author</button>
                    <button type="button" onClick={() => setShowLocation(v => !v)}>+ Location</button>
                </div>

                {showLocation && (
                    <div style={{ display: "grid", gap: 6 }}>
                        <label>Location</label>

                        {location && (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                                    {location.name}
                                </span>
                                <button type="button" onClick={() => setLocation(null)}>×</button>
                            </div>
                        )}

                        <input
                            value={locQ}
                            onChange={(e) => { setLocQ(e.target.value); setLocOpen(true); }}
                            onFocus={() => setLocOpen(true)}
                            placeholder="Search location…"
                        />

                        {locOpen && locSug.length > 0 && (
                            <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                                {locSug.map((it) => (
                                    <button
                                        key={it.id}
                                        type="button"
                                        onClick={() => { setLocation(it); setLocQ(""); setLocOpen(false); }}
                                        style={{ display: "block", width: "100%", textAlign: "left", padding: 10, border: "none", background: "white" }}
                                    >
                                        {it.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AUTHOR */}
                {showAuthor && (
                    <div style={{ display: "grid", gap: 6 }}>
                        <label>Author</label>

                        {author && (
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                                    {author.name}
                                </span>
                                <button type="button" onClick={() => setAuthor(null)}>×</button>
                            </div>
                        )}

                        <input
                            value={authorQ}
                            onChange={(e) => { setAuthorQ(e.target.value); setAuthorOpen(true); }}
                            onFocus={() => setAuthorOpen(true)}
                            placeholder="Search author…"
                        />

                        {authorOpen && authorSug.length > 0 && (
                            <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                                {authorSug.map((it) => (
                                    <button
                                        key={it.id}
                                        type="button"
                                        onClick={() => {
                                            setAuthor(it);
                                            setAuthorQ("");
                                            setAuthorOpen(false);
                                            setNewAuthor({ name: "", bio: "", birth_date: "", death_date: "" });
                                        }}
                                        style={{ display: "block", width: "100%", textAlign: "left", padding: 10, border: "none", background: "white" }}
                                    >
                                        {it.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ fontWeight: 600, marginTop: 6 }}>Or create new author</div>

                        <label>
                            Name
                            <input
                                value={newAuthor.name}
                                onChange={(e) => {
                                    setNewAuthor((p) => ({ ...p, name: e.target.value }));
                                    if (author) setAuthor(null);
                                }}
                            />
                        </label>

                        <label>
                            Bio
                            <textarea
                                value={newAuthor.bio}
                                onChange={(e) => setNewAuthor((p) => ({ ...p, bio: e.target.value }))}
                                rows={3}
                            />
                        </label>

                        <label>
                            Birth date
                            <input
                                type="date"
                                value={newAuthor.birth_date}
                                onChange={(e) => setNewAuthor((p) => ({ ...p, birth_date: e.target.value }))}
                            />
                        </label>

                        <label>
                            Death date
                            <input
                                type="date"
                                value={newAuthor.death_date}
                                onChange={(e) => setNewAuthor((p) => ({ ...p, death_date: e.target.value }))}
                            />
                        </label>

                        <small style={{ opacity: 0.7 }}>
                            Choose an existing author OR fill “Name” to create a new one.
                        </small>
                    </div>
                )}

                {/* MEDIA */}
                {showMedia && (
                    <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                        <div style={{ fontWeight: 600 }}>Media</div>

                        <label>
                            File
                            <input
                                type="file"
                                accept="image/*,video/*,audio/*,application/pdf"
                                onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                            />
                        </label>

                        <label>
                            Credits (optional)
                            <input
                                value={mediaCredits}
                                onChange={(e) => setMediaCredits(e.target.value)}
                                placeholder="Photo by … / Archive: …"
                            />
                        </label>

                        {mediaFile && (
                            <small style={{ opacity: 0.7 }}>
                                Selected: {mediaFile.name} ({roundMb(mediaFile.size)} MB)
                            </small>
                        )}
                    </div>
                )}

                {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
                {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

                <button type="submit" disabled={busy}>
                    {busy ? "…" : "Submit"}
                </button>
            </form>
        </main>
    );
}

export default SubmitPage;
