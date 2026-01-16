export default function LocationSection({
    open,
    location,
    setLocation,
    lookup,
    newLocation,
    setNewLocation,
}) {
    if (!open) return null;

    return (
        <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 600 }}>Location</div>

            {location && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ padding: "4px 10px", border: "1px solid #ddd", borderRadius: 999 }}>
                        {location.name}
                    </span>
                    <button type="button" onClick={() => setLocation(null)}>×</button>
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
                    placeholder="Search location…"
                />
            </label>

            {lookup.open && lookup.items.length > 0 && (
                <div style={{ border: "1px solid #ddd", borderRadius: 12, overflow: "hidden" }}>
                    {lookup.items.map((it) => (
                        <button
                            key={it.id}
                            type="button"
                            onClick={() => {
                                setLocation(it);
                                lookup.setQ("");
                                lookup.setOpen(false);
                                setNewLocation({ name: "", city: "", address: "" });
                            }}
                            style={{ display: "block", width: "100%", textAlign: "left", padding: 10, border: "none", background: "white" }}
                        >
                            <div style={{ fontWeight: 600 }}>{it.name}</div>
                            <div style={{ opacity: 0.7, fontSize: 12 }}>
                                {[it.city, it.address].filter(Boolean).join(" · ")}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div style={{ fontWeight: 600, marginTop: 6 }}>Or create new location</div>

            <label>
                Name
                <input
                    value={newLocation.name}
                    onChange={(e) => {
                        setNewLocation((p) => ({ ...p, name: e.target.value }));
                        if (location) setLocation(null);
                    }}
                    placeholder="e.g. Bar XYZ"
                />
            </label>

            <label>
                City (optional)
                <input
                    value={newLocation.city}
                    onChange={(e) => setNewLocation((p) => ({ ...p, city: e.target.value }))}
                    placeholder="e.g. Vienna"
                />
            </label>

            <label>
                Address (optional)
                <input
                    value={newLocation.address}
                    onChange={(e) => setNewLocation((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Street, number…"
                />
            </label>

            <small style={{ opacity: 0.7 }}>
                Choose an existing location OR fill “Name” to create a new one.
            </small>
        </div>
    );
}
