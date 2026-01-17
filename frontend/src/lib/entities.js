import { supabase } from "./supabase";

export async function ensureAuthorId({ selectedAuthor, newAuthor }) {
    if (selectedAuthor?.id) return selectedAuthor.id;

    const name = (newAuthor?.name || "").trim();
    if (!name) return null;

    const id = crypto.randomUUID();

    const { data, error } = await supabase
        .from("authors")
        .insert({
            id,
            name,
            bio: (newAuthor.bio || "").trim() || null,
            birth_date: newAuthor.birth_date || null,
            death_date: newAuthor.death_date || null,
        })

    if (!error) return id;

    // UNIQUE name -> existing author holen
    if (error.code === "23505") {
        const { data: existing, error: selErr } = await supabase
            .from("authors_public")
            .select("id")
            .eq("name", name)
            .limit(1)
            .maybeSingle();

        if (selErr) throw selErr;
        if (!existing) {
            throw new Error(`Author already exists, but could not be fetched (RLS?). Name: ${name}`);
        }
        return existing.id;
    }

    throw error;
}

export async function ensureLocationId({ selectedLocation, newLocation }) {
    if (selectedLocation?.id) return selectedLocation.id;

    const name = (newLocation?.name || "").trim();
    if (!name) return null;

    const id = crypto.randomUUID();

    const { data, error } = await supabase
        .from("locations")
        .insert({
            id,
            name,
            city: (newLocation.city || "").trim() || null,
            address: (newLocation.address || "").trim() || null,
        })

    if (error) throw error;
    return id;
}
