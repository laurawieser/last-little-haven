import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function normalizeStr(s) {
  return (s ?? "").toString().toLowerCase();
}

// Try to extract a comparable date string (YYYY-MM-DD) or year (YYYY) from originDate
function parseOriginDate(originDate) {
  if (!originDate) return null;

  const s = originDate.toString().trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return s + "-01";

  // YYYY
  if (/^\d{4}$/.test(s)) return s + "-01-01";

  // If it’s some other text format, skip (could be improved later)
  return null;
}

function getEntryCoverUrl(entry) {
  const media = Array.isArray(entry?.media_files) ? entry.media_files : [];
  const cover = media.find((m) => m.role === "COVER") || media[0];
  // cover.file_url kann externe https URL sein ODER storage public URL ODER storage path (falls du so speicherst)
  return cover?.file_url || entry?.image_url || null; // image_url nur legacy fallback
}

function ArchivePage() {
  const [entries, setEntries] = useState([]);
  const [locationsById, setLocationsById] = useState({});

  // Filters
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState(""); // location name (e.g. bar/space)
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState("");   // YYYY-MM-DD

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadEntries() {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("archive_entries")
        .select(`*, media_files ( id, file_url, role, credits )`)
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("archive_entries error:", error);
        setErrorMsg(error.message);
        setEntries([]);
        setLocationsById({});
        setLoading(false);
        return;
      }

      const rows = data ?? [];
      setEntries(rows);

      // Load locations for entries that have location_id
      const locationIds = Array.from(
        new Set(rows.map((e) => e.location_id).filter(Boolean))
      );

      if (locationIds.length === 0) {
        setLocationsById({});
        setLoading(false);
        return;
      }

      const { data: locData, error: locError } = await supabase
        .from("locations")
        .select("id,name,city,address,latitude,longitude")
        .in("id", locationIds);

      if (locError) {
        console.error("locations error:", locError);
        // Not fatal for archive list
        setLocationsById({});
      } else {
        const map = {};
        (locData ?? []).forEach((l) => (map[l.id] = l));
        setLocationsById(map);
      }

      setLoading(false);
    }

    loadEntries();
  }, []);

  // Build dropdown options from loaded data
  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(entries.map((e) => e.type).filter(Boolean)));
    types.sort((a, b) => a.localeCompare(b));
    return types;
  }, [entries]);

  const cityOptions = useMemo(() => {
    const cities = Object.values(locationsById)
      .map((l) => l.city)
      .filter(Boolean);
    const unique = Array.from(new Set(cities));
    unique.sort((a, b) => a.localeCompare(b));
    return unique;
  }, [locationsById]);

  const placeOptions = useMemo(() => {
    const names = Object.values(locationsById)
      .map((l) => l.name)
      .filter(Boolean);
    const unique = Array.from(new Set(names));
    unique.sort((a, b) => a.localeCompare(b));
    return unique;
  }, [locationsById]);

  const filteredEntries = useMemo(() => {
    const qn = normalizeStr(q);

    // Normalize date bounds
    const from = fromDate ? fromDate : null;
    const to = toDate ? toDate : null;

    return entries.filter((e) => {
      // Fulltext: title + description
      if (qn) {
        const hay = normalizeStr(e.title) + " " + normalizeStr(e.description);
        if (!hay.includes(qn)) return false;
      }

      // Type
      if (typeFilter && e.type !== typeFilter) return false;

      // Location filters
      const loc = e.location_id ? locationsById[e.location_id] : null;

      if (cityFilter) {
        if (!loc || loc.city !== cityFilter) return false;
      }

      if (placeFilter) {
        if (!loc || loc.name !== placeFilter) return false;
      }

      // Time range: based on originDate
      if (from || to) {
        const parsed = parseOriginDate(e.originDate);
        // If entry has no parseable originDate, exclude it when time filter is active
        if (!parsed) return false;

        if (from && parsed < from) return false;
        if (to && parsed > to) return false;
      }

      return true;
    });
  }, [entries, locationsById, q, typeFilter, cityFilter, placeFilter, fromDate, toDate]);

  function resetFilters() {
    setQ("");
    setTypeFilter("");
    setCityFilter("");
    setPlaceFilter("");
    setFromDate("");
    setToDate("");
  }

  return (
    <main className="container-archive">
      <h1>Archiv</h1>

      {/* Filters */}
      <section className="archive-filters" style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <label>
          Search (title/description)
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="z.B. Wien, Pride, Bar…"
          />
        </label>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label>
            Type
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            City
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
              <option value="">All</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            Space / Location
            <select value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
              <option value="">All</option>
              {placeOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          <label>
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </label>

          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        </div>

        <div style={{ opacity: 0.75 }}>
          {loading ? "Lade Einträge…" : `${filteredEntries.length} Treffer`}
          {errorMsg ? ` — Fehler: ${errorMsg}` : ""}
        </div>
      </section>

      {/* Results */}
      <section className="archive-list">
        {!loading && filteredEntries.length === 0 && (
          <p>No entries found.</p>
        )}

        {filteredEntries.map((entry) => {
          const coverUrl = getEntryCoverUrl(entry);

          return (
            <Link to={`/archive/${entry.id}`} key={entry.id} className="card-link">
              <div className="card">
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt={entry.title}
                    className="card-image"
                    onError={(e) =>
                      (e.currentTarget.src = "https://placehold.co/300x300?text=LLH")
                    }
                  />
                )}
                <h2>{entry.title}</h2>
                <p>{entry.type}</p>

                {/* Optional: show location + originDate if available */}
                {entry.location_id && locationsById[entry.location_id] && (
                  <p style={{ opacity: 0.75 }}>
                    {locationsById[entry.location_id].city} — {locationsById[entry.location_id].name}
                  </p>
                )}

                {entry.originDate && (
                  <p style={{ opacity: 0.65, fontSize: 12 }}>
                    Origin date: {entry.originDate}
                  </p>
                )}
              </div>
            </Link>
          );

        })}
      </section>
    </main>
  );
}

export default ArchivePage;
