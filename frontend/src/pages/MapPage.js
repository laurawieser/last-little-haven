// src/pages/MapPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../styles/pages/map.css"; // optional

// Leaflet Icon Fix (same as DetailPage)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER = [48.2082, 16.3738]; // Vienna fallback
const DEFAULT_ZOOM = 12;

function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // optional: allow focusing an entry via ?entryId=<uuid>
  const focusEntryId = searchParams.get("entryId");

  const [items, setItems] = useState([]); // { entry, location }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    async function loadMapEntries() {
      setLoading(true);
      setError(null);

      try {
        // Pull only approved entries that actually have a location_id
        // Join locations in one query (works if you have FK archive_entries.location_id -> locations.id)
        const { data, error: qErr } = await supabase
          .from("archive_entries")
          .select(
            `
            id,
            title,
            type,
            image_url,
            location_id,
            locations:location_id (
              id,
              name,
              address,
              city,
              latitude,
              longitude
            )
          `
          )
          .eq("status", "APPROVED")
          .not("location_id", "is", null);

        if (qErr) throw qErr;

        const cleaned = (data || [])
          .filter((row) => row.locations?.latitude && row.locations?.longitude)
          .map((row) => ({
            entry: {
              id: row.id,
              title: row.title,
              type: row.type,
              image_url: row.image_url,
            },
            location: row.locations,
          }));

        setItems(cleaned);

        // If we were sent here from a detail page, focus that marker
        if (focusEntryId) {
          const focused = cleaned.find((x) => x.entry.id === focusEntryId);
          if (focused) {
            setCenter([
              parseFloat(focused.location.latitude),
              parseFloat(focused.location.longitude),
            ]);
            setZoom(16);
            return;
          }
        }

        // Otherwise center on first item (or fallback Vienna)
        if (cleaned.length > 0) {
          setCenter([
            parseFloat(cleaned[0].location.latitude),
            parseFloat(cleaned[0].location.longitude),
          ]);
          setZoom(12);
        } else {
          setCenter(DEFAULT_CENTER);
          setZoom(DEFAULT_ZOOM);
        }
      } catch (err) {
        console.error(err);
        setError("Karte konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    loadMapEntries();
  }, [focusEntryId]);

  const markers = useMemo(() => {
    return items.map(({ entry, location }) => {
      const lat = parseFloat(location.latitude);
      const lng = parseFloat(location.longitude);

      return (
        <Marker key={entry.id} position={[lat, lng]}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>{entry.title}</strong>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{entry.type}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12 }}>
                  {location.name}
                  {location.city ? `, ${location.city}` : ""}
                </div>
              </div>
              <button
                style={{ marginTop: 8, width: "100%" }}
                onClick={() => navigate(`/detail/${entry.id}`)}
              >
                Open details
              </button>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [items, navigate]);

  return (
    <main className="container-map">
      <h1>Map</h1>

      {loading && <div className="loading">Laden...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "70vh", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {markers}
          </MapContainer>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 12 }}>
          No entries with location found.
        </p>
      )}
    </main>
  );
}

export default MapPage;