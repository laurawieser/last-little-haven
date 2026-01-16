import { supabase } from "./supabase";

export async function ensureAuthorId({ selectedAuthor, newAuthor }) {
    if (selectedAuthor?.id) return selectedAuthor.id;

    const name = (newAuthor?.name || "").trim();
    if (!name) return null;

    const { data, error } = await supabase
        .from("authors")
        .insert({
            name,
            bio: (newAuthor.bio || "").trim() || null,
            birth_date: newAuthor.birth_date || null,
            death_date: newAuthor.death_date || null,
        })
        .select("id")
        .single();

    if (error) throw error;
    return data.id;
}

export async function ensureLocationId({ selectedLocation, newLocation }) {
    if (selectedLocation?.id) return selectedLocation.id;

    const name = (newLocation?.name || "").trim();
    if (!name) return null;

    const { data, error } = await supabase
        .from("locations")
        .insert({
            name,
            city: (newLocation.city || "").trim() || null,
            address: (newLocation.address || "").trim() || null,
        })
        .select("id")
        .single();

    if (error) throw error;
    return data.id;
}
