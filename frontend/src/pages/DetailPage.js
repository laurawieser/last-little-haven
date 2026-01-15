// src/pages/DetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "../styles/pages/entry-detail.css";
import { useAuth } from "../auth/AuthContext";

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function parseKeywords(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return input.split(/,\s*|;\s*/).map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function tryParseJSON(str) {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [str];
  }
}

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [entry, setEntry] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    async function loadEntry() {
      try {
        const { data: entryData, error: entryError } = await supabase
          .from("archive_entries").select("*").eq("id", id).single();
        if (entryError) throw entryError;
        setEntry(entryData);

        if (entryData.location_id) {
          const { data: locData } = await supabase
            .from("locations").select("*").eq("id", entryData.location_id).single();
          setLocation(locData);
        }
      } catch (err) {
        console.error(err);
        setError("Eintrag konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }
    loadEntry();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Willst du diesen Eintrag wirklich löschen?")) return;
    const { error } = await supabase.from("archive_entries").delete().eq("id", id);
    if (error) {
      alert("Löschen fehlgeschlagen: " + error.message);
      return;
    }
    navigate("/archive");
  }

  if (loading) return <div className="loading">Lade Eintrag…</div>;
  if (error) return <div className="error">{error}</div>;
  if (!entry) return <div>Eintrag nicht gefunden.</div>;

  const keywords = parseKeywords(entry.keywords);
  const externalLinks = tryParseJSON(entry.externalLinks);
  const hasTitle = entry.title && entry.title.trim() !== '';
  const displayType = (entry.type || 'ORT').toUpperCase();

  return (
    <main className="detail-container">
      <div className="image-wrapper" onClick={() => setShowImage(true)}>
        <img src={entry.image_url || "https://placehold.co/600x400/2B2E30/C4C7C8?text=LLH"} alt={entry.title || entry.type} className="detail-image" />
        <div className="image-overlay-tab">
          {hasTitle && <h1>{entry.title}</h1>}
          <p className="type">{displayType}</p>
        </div>
        {keywords.length > 0 && (
          <div className="tag-container">
            {keywords.map((k, i) => <span key={i} className="tag">{k}</span>)}
          </div>
        )}
      </div>

      <div className="entry-info-container">
        {entry.description && (
          <div className="description-box">
            <p>{entry.description}</p>
            {entry.originDate && <p><strong>Origin Date:</strong> {entry.originDate}</p>}
            {entry.author_name && <p><strong>Author:</strong> {entry.author_name}</p>}
            
            {/* ← LOCATION ROW */}
            {location && (
              <div className="location-row">
                <div className="location-map-small">
                  <MapContainer center={[parseFloat(location.latitude), parseFloat(location.longitude)]} zoom={15} style={{ height: "100%", width: "100%", borderRadius: "12px" }}>
                    <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" attribution="© OpenStreetMap" />
                    <Marker position={[parseFloat(location.latitude), parseFloat(location.longitude)]}>
                      <Popup>{location.name}<br/>{location.address}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="location-info-right">
                  <p><strong>{location.name}</strong></p>
                  <p>{location.address}, {location.city}</p>
                  {externalLinks.length > 0 && (
                    <p className="location-links">
                      {externalLinks.map((l, i) => (
                        <span key={i}>
                          <a href={l} target="_blank" rel="noreferrer">{l}</a>
                          {i < externalLinks.length - 1 && <> • </>}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!location && externalLinks.length > 0 && (
          <div className="description-box">
            <p className="location-links">
              {externalLinks.map((l, i) => (
                <span key={i}>
                  <a href={l} target="_blank" rel="noreferrer">{l}</a>
                  {i < externalLinks.length - 1 && <> • </>}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>

      <div className="detail-actions">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back to archive</button>
        {role === "admin" && <button className="btn-delete" onClick={handleDelete}>🗑 Delete</button>}
      </div>

      {showImage && (
        <div className="image-modal" onClick={() => setShowImage(false)}>
          <img src={entry.image_url} alt={entry.title || entry.type} />
        </div>
      )}
    </main>
  );
}

export default DetailPage;
