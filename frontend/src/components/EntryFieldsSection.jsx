const TYPE_OPTIONS = [
    { value: "", label: "Select type…" },
    { value: "Space", label: "Space" },
    { value: "Artifact", label: "Artifact" },
    { value: "Photography", label: "Photography" },
];

export default function EntryFieldsSection({ form, setForm }) {
    function set(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    return (
        <>
            <label>
                Title
                <input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    type="text"
                />
            </label>

            <label>
                Description
                <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                />
            </label>

            <label>
                Type
                <select value={form.type} onChange={(e) => set("type", e.target.value)}>
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
                    value={form.keywordsRaw}
                    onChange={(e) => set("keywordsRaw", e.target.value)}
                    placeholder="flyer, punk, 2000s"
                />
            </label>

            <label>
                Origin date
                <input
                    type="date"
                    value={form.origin_date}
                    onChange={(e) => set("origin_date", e.target.value)}
                />
            </label>

            <label>
                External links (comma separated)
                <input
                    value={form.external_links_raw}
                    onChange={(e) => set("external_links_raw", e.target.value)}
                />
            </label>
        </>
    );
}
