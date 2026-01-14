import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("de-AT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nowIso = new Date().toISOString();

    supabase
      .from("events")
      .select("id,title,start_at,end_at,description,location,external_url")
      .gte("start_at", nowIso)
      .order("start_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("EventsList load error:", error);
          setEvents([]);
        } else {
          setEvents(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events…</p>;
  if (events.length === 0) return <p>No upcoming events.</p>;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      {events.map((e) => (
        <div key={e.id} className="card" style={{ display: "grid", gap: 8 }}>
          <div>
            <strong>{e.title}</strong>
            {e.start_at && (
              <div style={{ opacity: 0.8 }}>{formatDateTime(e.start_at)}</div>
            )}
            {e.location && <div style={{ opacity: 0.8 }}>{e.location}</div>}
          </div>

          {e.description && <p style={{ margin: 0 }}>{e.description}</p>}

          {e.external_url && (
            <div>
              <a
                href={e.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Details
              </a>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export default EventsList;
