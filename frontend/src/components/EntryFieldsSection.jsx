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
                    value={form.originDate}
                    onChange={(e) => set("originDate", e.target.value)}
                />
            </label>

            <label>
                External links (comma separated)
                <input
                    value={form.externalLinksRaw}
                    onChange={(e) => set("externalLinksRaw", e.target.value)}
                    placeholder="https://…, https://…"
                />
            </label>

            <label>
                Image URL (optional)
                <input
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    type="url"
                    placeholder="https://picsum.photos/300/200"
                />
            </label>
        </>
    );
}
