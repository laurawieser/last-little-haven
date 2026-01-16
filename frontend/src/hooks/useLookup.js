import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useLookup({ table, select, searchColumn = "name", limit = 8 }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      if (!q.trim()) { setItems([]); return; }

      const { data, error } = await supabase
        .from(table)
        .select(select)
        .ilike(searchColumn, `%${q}%`)
        .order(searchColumn)
        .limit(limit);

      if (!ignore) setItems(error ? [] : (data ?? []));
    }

    run();
    return () => { ignore = true; };
  }, [q, table, select, searchColumn, limit]);

  return { q, setQ, open, setOpen, items, setItems };
}
