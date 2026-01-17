// src/components/LeafletMap.jsximport React, { useState, useRef, useEffect } from "react";
import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "../styles/components/leaflet-map.css"; 
import "leaflet/dist/leaflet.css";

// Leaflet Marker Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
delete L.Icon.Default.prototype._getIconShadowUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Hilfskomponente, um Karte auf neue Position zu zentrieren
function MapUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

export default function LeafletMap({
  center = [48.2082, 16.3738],
  zoom = 12,
  height = "300px",
  width = "100%",
  children,
  tileUrl = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
}) {
  const [showAttribution, setShowAttribution] = useState(false);
  const modalRef = useRef(null);

  // Klick außerhalb schließen
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAttribution(false);
      }
    }

    if (showAttribution) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAttribution]);

  return (
    <div style={{ position: "relative", height, width }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={tileUrl} attribution="" />
        {children}
        <MapUpdater center={center} zoom={zoom} />
      </MapContainer>

      {/* Info-Icon 🛈 */}
      <div
        className="leaflet-info-icon"
        onClick={() => setShowAttribution(!showAttribution)}
        title="Show map attribution"
      >
        🛈
      </div>

      {showAttribution && (
        <div className="leaflet-attribution-modal" ref={modalRef}>
          <p>
            © <a href="https://www.stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> | 
            © <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> | 
            © <a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors
          </p>
        </div>
      )}
    </div>
  );
}
