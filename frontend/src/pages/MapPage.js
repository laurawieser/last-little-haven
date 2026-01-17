// src/pages/MapPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LeafletMap from "../components/LeafletMap";
import { Marker, Popup } from "react-leaflet";

const DEFAULT_CENTER = [48.2082, 16.3738]; // Vienna
const DEFAULT_ZOOM = 12;

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusEntryId = searchParams.get("entryId");

  const [items, setItems] = useState([]);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourSpaces, setTourSpaces] = useState([]);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Current tour point
  const currentSpace = tourSpaces[currentTourIndex]?.archive_entries;

  // Load normal entries + tour list
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        // Normal map entries
        const { data: entriesData } = await supabase
          .from("archive_entries")
          .select(`
            id, title, type, image_url, location_id,
            locations:location_id (id, name, address, city, latitude, longitude)
          `)
          .eq("status", "APPROVED")
          .not("location_id", "is", null);

        const cleanedItems = (entriesData || [])
          .filter((row) => row.locations?.latitude && row.locations?.longitude)
          .map((row) => ({
            entry: { id: row.id, title: row.title, type: row.type, image_url: row.image_url },
            location: row.locations,
          }));

        setItems(cleanedItems);

        // Tours
        const { data: toursData } = await supabase.from("tours").select("id, name");
        setTours(toursData || []);

        // Focus on entryId if provided
        if (focusEntryId) {
          const focused = cleanedItems.find((x) => x.entry.id === focusEntryId);
          if (focused) {
            setCenter([parseFloat(focused.location.latitude), parseFloat(focused.location.longitude)]);
            setZoom(16);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [focusEntryId]);

  // Center map on current tour pin
  useEffect(() => {
    if (tourSpaces.length > 0 && currentTourIndex < tourSpaces.length) {
      const space = tourSpaces[currentTourIndex];
      const lat = parseFloat(space.archive_entries.locations.latitude);
      const lng = parseFloat(space.archive_entries.locations.longitude);
      setCenter([lat, lng]);
      setZoom(15);
    }
  }, [currentTourIndex, tourSpaces]);

  // Tour navigation
  const nextTourPin = () => {
    if (currentTourIndex < tourSpaces.length - 1) {
      setCurrentTourIndex(currentTourIndex + 1);
    }
  };

  const prevTourPin = () => {
    if (currentTourIndex > 0) {
      setCurrentTourIndex(currentTourIndex - 1);
    }
  };

  // Start a tour
  const startTour = async (tourId) => {
    const tour = tours.find((t) => t.id === tourId);
    setSelectedTour(tour);

    const { data, error } = await supabase
      .from("tour_spaces")
      .select(`
        sequence_order,
        archive_entries (
          id, title, type, image_url,
          locations (id, name, latitude, longitude, city, address)
        )
      `)
      .eq("tour_id", tourId)
      .order("sequence_order", { ascending: true });

    if (error) console.error(error);
    setTourSpaces(data || []);
    setCurrentTourIndex(0);
  };

  // Normal markers with full opacity
  const normalMarkers = useMemo(
    () =>
      items.map(({ entry, location }) => (
        <Marker
          key={entry.id}
          position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
          opacity={1} // always full opacity
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>{entry.title}</strong>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{entry.type}</div>
              <div style={{ fontSize: 12 }}>
                {location.name}
                {location.city ? `, ${location.city}` : ""}
              </div>
              <button style={{ marginTop: 8, width: "100%" }} onClick={() => navigate(`/archive/${entry.id}`)}>
                Open Details
              </button>
            </div>
          </Popup>
        </Marker>
      )),
    [items, navigate]
  );

  // Tour markers with opacity
  const tourMarkers = useMemo(() => {
    if (!selectedTour || tourSpaces.length === 0) return [];

    return tourSpaces.map((space, idx) => {
      const loc = space.archive_entries.locations;
      const isCurrent = idx === currentTourIndex;
      const opacity = isCurrent ? 1 : 0.3;

      return (
        <Marker
          key={space.archive_entries.id}
          position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
          opacity={opacity}
        >
          <Popup>
            <div>
              <strong>{space.archive_entries.title}</strong> ({idx + 1}/{tourSpaces.length})
              <button
                style={{ marginTop: 8, width: "100%" }}
                onClick={() => navigate(`/detail/${space.archive_entries.id}`)}
              >
                Open Details
              </button>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [selectedTour, tourSpaces, currentTourIndex, navigate]);

  return (
    <main className="container-map">
      {/* Tour selection */}
      <div className="tour-selector" style={{ marginBottom: 16 }}>
        <select
          value={selectedTour?.id || ""}
          onChange={(e) => (e.target.value ? startTour(e.target.value) : setSelectedTour(null))}
          style={{ marginRight: 8, padding: 8 }}
        >
          <option value="">No Tour</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.name}
            </option>
          ))}
        </select>

        {selectedTour && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>{selectedTour.name}</strong>
            <span>
              ({currentTourIndex + 1}/{tourSpaces.length})
            </span>
            <button onClick={prevTourPin} disabled={currentTourIndex === 0}>
              Previous
            </button>
            <button onClick={nextTourPin} disabled={currentTourIndex === tourSpaces.length - 1}>
              Next
            </button>
            <button
              onClick={() => {
                setSelectedTour(null);
                setTourSpaces([]);
                setCurrentTourIndex(0);
                setCenter(DEFAULT_CENTER);
                setZoom(DEFAULT_ZOOM);
              }}
            >
              End Tour
            </button>
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <LeafletMap center={center} zoom={zoom} height="70vh" width="100%">
            {selectedTour ? tourMarkers : normalMarkers}

            {/* Overlay: Current tour point info */}
            {selectedTour && currentSpace && (
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.9)",
                  padding: "12px",
                  borderRadius: 8,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  maxWidth: 220,
                  zIndex: 1000,
                }}
              >
                <h4 style={{ margin: 0 }}>{currentSpace.title}</h4>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{currentSpace.type}</div>
                {currentSpace.locations && (
                  <div style={{ fontSize: 12 }}>
                    {currentSpace.locations.name}
                    {currentSpace.locations.city ? `, ${currentSpace.locations.city}` : ""}
                  </div>
                )}
                {currentSpace.image_url && (
                  <img
                    src={currentSpace.image_url}
                    alt={currentSpace.title}
                    style={{ width: "100%", borderRadius: 4, marginTop: 8 }}
                  />
                )}
              </div>
            )}
          </LeafletMap>
        </div>
      )}
    </main>
  );
}
