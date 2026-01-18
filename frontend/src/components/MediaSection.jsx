export default function MediaSection({
    open,
    mode,
    setMode,
    externalUrl,
    setExternalUrl,
    mediaFile,
    setMediaFile,
    mediaCredits,
    setMediaCredits,
    roundMb,
}) {
    if (!open) return null;

    return (
        <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 600 }}>Media</div>

            {/* Toggle */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                        type="radio"
                        name="mediaMode"
                        value="upload"
                        checked={mode === "upload"}
                        onChange={() => {
                            setMode("upload");
                            setExternalUrl("");
                        }}
                    />
                    Upload
                </label>

                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                        type="radio"
                        name="mediaMode"
                        value="external"
                        checked={mode === "external"}
                        onChange={() => {
                            setMode("external");
                            setMediaFile(null);
                        }}
                    />
                    External URL
                </label>
            </div>

            {/* UPLOAD MODE */}
            {mode === "upload" && (
                <>
                    <label>
                        File
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
                        />
                    </label>

                    {mediaFile && (
                        <small style={{ opacity: 0.7 }}>
                            Selected: {mediaFile.name} ({roundMb(mediaFile.size)} MB)
                        </small>
                    )}
                </>
            )}

            {/* EXTERNAL MODE */}
            {mode === "external" && (
                <label>
                    Image URL
                    <input
                        type="url"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        placeholder="https://…"
                    />
                </label>
            )}

            {/* Credits for BOTH */}
            <label>
                Credits (optional)
                <input
                    value={mediaCredits}
                    onChange={(e) => setMediaCredits(e.target.value)}
                    placeholder="Photo by … / Archive: …"
                />
            </label>
        </div>
    );
}
