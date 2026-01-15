import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";

const TYPE_OPTIONS = [
    { value: "", label: "Select type…" },
    { value: "Space", label: "Space" },
    { value: "Artifact", label: "Artifact" },
    { value: "Photography", label: "Photography" },
];

function SubmitPage() {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showAuthor, setShowAuthor] = useState(false);
    const [showLocation, setShowLocation] = useState(false);

    const [author, setAuthor] = useState(null);
    const [authorQ, setAuthorQ] = useState("");
    const [authorSug, setAuthorSug] = useState([]);
    const [authorOpen, setAuthorOpen] = useState(false);

    const [location, setLocation] = useState(null);   // {id,name}
    const [locQ, setLocQ] = useState("");
    const [locSug, setLocSug] = useState([]);
    const [locOpen, setLocOpen] = useState(false);

    useEffect(() => {
        let ignore = false;
        async function run() {
            if (!locQ.trim()) { setLocSug([]); return; }
            const { data } = await supabase
                .from("locations")
                .select("id,name")
                .ilike("name", `%${locQ}%`)
                .order("name")
                .limit(8);
            if (!ignore) setLocSug(data ?? []);
        }
        run();
        return () => { ignore = true; };
    }, [locQ]);

    useEffect(() => {
        let ignore = false;
        async function run() {
            if (!authorQ.trim()) { setAuthorSug([]); return; }
            const { data } = await supabase
                .from("authors")
                .select("id,name")
                .ilike("name", `%${authorQ}%`)
                .order("name")
                .limit(8);
            if (!ignore) setAuthorSug(data ?? []);
        }
        run();
        return () => { ignore = true; };
    }, [authorQ]);

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        if (!user) {
            setErrorMsg("Not logged in.");
            setBusy(false);
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim(),
            type: type.trim(),
            image_url: imageUrl.trim() || null,
            created_by: user.id,
            status: "SUBMITTED",
            location_id: location?.id ?? null,
            author_id: author?.id ?? null,
        };

        // Minimal validation
        if (!payload.title || !payload.description || !payload.type) {
            setBusy(false);
            setErrorMsg("Please fill out title, description and type");
            return;
        }

        const { error } = await supabase.from("archive_entries").insert(payload);

        setBusy(false);

        if (error) {
            console.error("insert error:", error);
            setErrorMsg(error.message);
            return;
        }

        setSuccessMsg("Thank you! Your submission has been saved.");
        setTitle("");
        setDescription("");
        setType("");
        setImageUrl("");
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
                            value={locQ}
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
                                        onClick={() => { setAuthor(it); setAuthorQ(""); setAuthorOpen(false); }}
                                        style={{ display: "block", width: "100%", textAlign: "left", padding: 10, border: "none", background: "white" }}
                                    >
                                        {it.name}
                                    </button>
                                ))}
                            </div>
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
