import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function FavoritesPage() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadFavorites() {
    if (!user) return;

    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        created_at,
        archive_entry_id,
        archive_entries (
          id,
          title,
          type,
          image_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setRows([]);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function removeFavorite(archiveEntryId) {
    if (!user) return;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("archive_entry_id", archiveEntryId);

    if (error) {
      alert(error.message);
      return;
    }

    setRows((prev) => prev.filter((r) => r.archive_entry_id !== archiveEntryId));
  }

  if (!user) return <div>Please log in.</div>;
  if (loading) return <div>Loading favorites…</div>;

  return (
    <main className="container-favorites">
      <h1>Favorites</h1>

      {errorMsg && <p className="favorites-error">{errorMsg}</p>}

      {rows.length === 0 ? (
        <p>No favorites saved.</p>
      ) : (
        <section className="favorites-list">
          {rows.map((fav) => {
            const entry = fav.archive_entries;
            if (!entry) return null;

            return (
              <div key={fav.id} className="favorites-item">
                <img
                  className="favorites-thumb"
                  src={entry.image_url || "https://placehold.co/80x80?text=LLH"}
                  alt={entry.title || entry.type || "Entry"}
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/80x80?text=LLH")}
                />

                <div className="favorites-meta">
                  <div className="favorites-title">
                    <Link to={`/archive/${entry.id}`}>
                      {entry.title || "(ohne Titel)"}
                    </Link>
                  </div>
                  <div className="favorites-type">
                    {(entry.type || "ORT").toUpperCase()}
                  </div>
                </div>

                <div className="favorites-actions">
                  <button type="button" onClick={() => removeFavorite(entry.id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
