export default function AuthorSection({
    open,
    author,
    setAuthor,
    lookup,
    newAuthor,
    setNewAuthor,
}) {
    if (!open) return null;

    return (
        <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 600 }}>Author</div>

            {author && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                        {author.name}
                    </span>
                    <button type="button" onClick={() => setAuthor(null)}>×</button>
                </div>
            )}

            <label>
                Search existing
                <input
                    value={lookup.q}
                    onChange={(e) => {
                        lookup.setQ(e.target.value);
                        lookup.setOpen(true);
                    }}
                    onFocus={() => lookup.setOpen(true)}
                    placeholder="Search author…"
                />
            </label>

            {lookup.open && lookup.items.length > 0 && (
                <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                    {lookup.items.map((it) => (
                        <button
                            key={it.id}
                            type="button"
                            onClick={() => {
                                setAuthor(it);
                                lookup.setQ("");
                                lookup.setOpen(false);
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
                Bio (optional)
                <textarea
                    value={newAuthor.bio}
                    onChange={(e) => setNewAuthor((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                />
            </label>

            <label>
                Birth date (optional)
                <input
                    type="date"
                    value={newAuthor.birth_date}
                    onChange={(e) => setNewAuthor((p) => ({ ...p, birth_date: e.target.value }))}
                />
            </label>

            <label>
                Death date (optional)
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
    );
}
