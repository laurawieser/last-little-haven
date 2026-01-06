import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { Link } from 'react-router-dom';

function ArchivePage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function loadEntries() {
      const { data, error } = await supabase
        .from('archive_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log("archive_entries data:", data);
      console.log("archive_entries error:", error);

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
          <Link to={`/archive/${entry.id}`} key={entry.id} className="card-link">
            <div className="card">
              {entry.image_url && (
                <img 
                  src={entry.image_url} 
                  alt={entry.title}
                  className="card-image"
                  onError={(e) => e.currentTarget.src = "https://placehold.co/300x300?text=LLH"}
                />
              )}
              <h2>{entry.title}</h2>
              <p>{entry.type}</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );

}

export default ArchivePage;
