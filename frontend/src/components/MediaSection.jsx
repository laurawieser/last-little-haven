export default function MediaSection({
    open,
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
    );
}
