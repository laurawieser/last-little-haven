import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";


function SubmitPage() {
    const { user } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        const payload = {
            title: title.trim(),
            description: description.trim(),
            type: type.trim(),
            image_url: imageUrl.trim() || null,
            created_by: user.id,
        };

        // Minimal validation
        if (!payload.title || !payload.description || !payload.type) {
            setBusy(false);
            setErrorMsg("Bitte Titel, Beschreibung und Typ ausfüllen.");
            return;
        }

        const { error } = await supabase.from("archive_entries").insert(payload);

        setBusy(false);

        if (!user) {
            setErrorMsg("Nicht eingeloggt.");
            setBusy(false);
            return;
        }

        if (error) {
            console.error("insert error:", error);
            setErrorMsg(error.message);
            return;
        }

        setSuccessMsg("Danke! Eintrag wurde gespeichert.");
        setTitle("");
        setDescription("");
        setType("");
        setImageUrl("");
    }

    return (
        <main className="container submit">
            <h1>Neuen Ort einreichen</h1>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
                <label>
                    Titel
                    <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" />
                </label>

                <label>
                    Beschreibung
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>

                <label>
                    Typ
                    <input value={type} onChange={(e) => setType(e.target.value)} type="text" placeholder="z.B. Ort, Artefakt, Fotografie" />
                </label>

                <label>
                    Bild-URL (optional)
                    <input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        type="url"
                        placeholder="https://picsum.photos/300/200"
                    />
                </label>

                {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
                {successMsg && <p style={{ color: "green" }}>{successMsg}</p>}

                <button type="submit" disabled={busy}>
                    {busy ? "…" : "Absenden"}
                </button>
            </form>
        </main>
    );
}

export default SubmitPage;
