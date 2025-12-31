import React, { useEffect, useState } from 'react';
import '../styles/main.css';
import { supabase } from '../lib/supabase';

function ArchivePage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function loadEntries() {
      const { data, error } = await supabase
        .from('archive_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setEntries(data);
      }
    }

    loadEntries();
  }, []);

  return (
    <main className="container-archive">

      <h1>Archiv</h1>

      <section className="archive-list">
        {entries.map((entry) => (
          <div key={entry.id} className="card">
            {entry.image_url && (
              <img
                src={entry.image_url}
                alt={entry.title}
                className="card-image"
              />
            )}
            <h2>{entry.title}</h2>
            <p>{entry.type}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

export default ArchivePage;
