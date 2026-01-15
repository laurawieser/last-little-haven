// src/pages/DetailPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../styles/pages/entry-detail.css';
import { useAuth } from "../auth/AuthContext";

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [entry, setEntry] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEntry() {
      try {
        const { data: entryData, error: entryError } = await supabase
          .from('archive_entries')
          .select('*')
          .eq('id', id)
          .single();

        if (entryError) throw entryError;
        setEntry(entryData);

        if (entryData.location_id) {
          const { data: locData } = await supabase
            .from('locations')
            .select('*')
            .eq('id', entryData.location_id)
            .single();
          setLocation(locData);
        }
      } catch (err) {
        setError('Entry could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    loadEntry();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  async function handleDelete() {
    const ok = window.confirm("Are you sure you want to delete this entry?");
    if (!ok) return;

    const { error } = await supabase
      .from("archive_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("delete error:", error);
      alert("Löschen fehlgeschlagen: " + error.message);
      return;
    }

    navigate("/archive");
  }


  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!entry) return <div>Entry not found.</div>;

  return (
    <main className="container-detail">
      <article className="entry-detail">
        <img 
          src={entry.image_url || 'https://placehold.co/600x400/45B7D1/FFFFFF?text=LLH'} 
          alt={entry.title}
          className="detail-image"
        />
        <div className="detail-content">
          <h1>{entry.title}</h1>
          <p className="detail-type">{entry.type}</p>
          <p className="detail-description">{entry.description}</p>
          
          {location && (
            <div className="detail-location">
              <h2>Location</h2>
              <p><strong>{location.name}</strong></p>
              <p>{location.address}, {location.city}</p>
              
              {/* MINI-MAP STATT GOOGLE LINK */}
              <div className="mini-map-container">
                <MapContainer 
                  center={[parseFloat(location.latitude), parseFloat(location.longitude)]} 
                  zoom={15} 
                  style={{ height: '250px', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <Marker position={[parseFloat(location.latitude), parseFloat(location.longitude)]}>
                    <Popup>
                      <strong>{location.name}</strong><br />
                      {location.address}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
          
          <div className="detail-actions">
            <button className="btn-back" onClick={handleBack}>
              ← Back to archive
            </button>

             {/* ✅ Only visible for admins */}
            {role === "ADMIN" && (
              <button
                className="btn-delete"
                onClick={handleDelete}
                style={{ marginLeft: 12 }}
              >
                🗑 Delete
              </button>
            )}
            
          </div>
        </div>
      </article>
    </main>
  );
}

export default DetailPage;
