import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { roundMb } from "../lib/media";
import { useLookup } from "../hooks/useLookup";
import { createArchiveEntry } from "../lib/archiveEntries";

import EntryFieldsSection from "../components/EntryFieldsSection";
import LocationSection from "../components/LocationSection";
import AuthorSection from "../components/AuthorSection";
import MediaSection from "../components/MediaSection";

const INITIAL_FORM = {
    title: "",
    description: "",
    type: "",
    imageUrl: "",
    keywordsRaw: "",
    origin_date: "",
    external_links_raw: "",
};

function SubmitPage() {
    const { user } = useAuth();
    const [form, setForm] = useState(INITIAL_FORM);

    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [showAuthor, setShowAuthor] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showMedia, setShowMedia] = useState(false);

    // Author select + create
    const [author, setAuthor] = useState(null);
    const [newAuthor, setNewAuthor] = useState({ name: "", bio: "", birth_date: "", death_date: "" });
    const authorLookup = useLookup({ table: "authors_public", select: "id,name" });

    // Location select + create
    const [location, setLocation] = useState(null);   // {id,name} | null
    const locLookup = useLookup({
        table: "locations",
        select: "id,name,city,address"
    });
    const [newLocation, setNewLocation] = useState({
        name: "",
        city: "",
        address: "",
    });

    // Media
    const [mediaFile, setMediaFile] = useState(null); // File|null
    const [mediaCredits, setMediaCredits] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await createArchiveEntry({
                userId: user?.id,
                form,
                authorState: { show: showAuthor, author, newAuthor },
                locationState: { show: showLocation, location, newLocation },
                mediaState: { show: showMedia, file: mediaFile, credits: mediaCredits },
            });

            setSuccessMsg("Thank you! Your submission has been saved.");

            // reset
            setForm({ ...INITIAL_FORM });

            setAuthor(null);
            setNewAuthor({ name: "", bio: "", birth_date: "", death_date: "" });
            authorLookup.setQ(""); 
            authorLookup.setOpen(false);

            setLocation(null);
            setNewLocation({ name: "", city: "", address: "" });
            locLookup.setQ(""); 
            locLookup.setOpen(false);

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
                <EntryFieldsSection form={form} setForm={setForm} />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" disabled={busy} onClick={() => setShowAuthor(v => !v)}>+ Author</button>
                    <button type="button" disabled={busy} onClick={() => setShowLocation(v => !v)}>+ Location</button>
                    <button type="button" disabled={busy} onClick={() => setShowMedia(v => !v)}>+ Media</button>
                </div>

                {/* LOCATION */}
                <LocationSection
                    open={showLocation}
                    location={location}
                    setLocation={setLocation}
                    lookup={locLookup}
                    newLocation={newLocation}
                    setNewLocation={setNewLocation}
                />

                {/* AUTHOR */}
                <AuthorSection
                    open={showAuthor}
                    author={author}
                    setAuthor={setAuthor}
                    lookup={authorLookup}
                    newAuthor={newAuthor}
                    setNewAuthor={setNewAuthor}
                />

                {/* MEDIA */}
                <MediaSection
                    open={showMedia}
                    mediaFile={mediaFile}
                    setMediaFile={setMediaFile}
                    mediaCredits={mediaCredits}
                    setMediaCredits={setMediaCredits}
                    roundMb={roundMb}
                />

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
