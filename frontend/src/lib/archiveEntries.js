// src/lib/archiveEntries.js
import { supabase } from "./supabase";
import { parseCommaList } from "./formUtils";
import { uploadToStorage } from "./media";
import { ensureAuthorId, ensureLocationId } from "./entities";

/**
 * Creates a new archive entry.
 * - Anonymous submissions allowed (created_by can be null)
 * - IMPORTANT: Do NOT use .select() for anon inserts (would require SELECT RLS for SUBMITTED)
 * - IMPORTANT: Column names match your schema: originDate + externalLinks (camelCase)
 * - Media linking is done via media_files.archive_entry_id (NOT archive_entries.media_file_id)
 *
 * Default behavior:
 * - Media upload requires login (userId). Anonymous can still submit entry without media.
 */
export async function createArchiveEntry({
  userId,
  form,
  authorState,
  locationState,
  mediaState,
}) {
  const title = (form.title || "").trim();
  const description = (form.description || "").trim();
  const type = (form.type || "").trim();

  if (!title || !description || !type) {
    throw new Error("Please fill out title, description and type");
  }

  const keywords = parseCommaList(form.keywordsRaw);
  const externalLinks = parseCommaList(form.externalLinksRaw);

  // 1) optional relations (allowed for anon because you created anon insert policies on authors/locations)
  const author_id = authorState?.show
    ? await ensureAuthorId({
        selectedAuthor: authorState.author,
        newAuthor: authorState.newAuthor,
      })
    : null;

  const location_id = locationState?.show
    ? await ensureLocationId({
        selectedLocation: locationState.location,
        newLocation: locationState.newLocation,
      })
    : null;

  // 2) Prepare entry payload
  // NOTE: Use correct column names from your DB schema (camelCase)
  const payload = {
    title,
    description,
    type,
    image_url: (form.imageUrl || "").trim() || null,

    keywords,
    originDate: form.originDate || null,   // ✅ correct column name
    externalLinks,                         // ✅ correct column name

    created_by: userId ?? null,
    status: "SUBMITTED",

    author_id,
    location_id,
  };

  // 3) Insert archive entry
  // IMPORTANT:
  // - If anon: DO NOT call .select() / .single() (RETURNING would require SELECT policy for SUBMITTED)
  // - If logged in: it's okay to return id (users_can_read_own_entries allows select)
  let entryId = null;

  if (userId) {
    const { data, error } = await supabase
      .from("archive_entries")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw error;
    entryId = data.id;
  } else {
    const { error } = await supabase.from("archive_entries").insert(payload);
    if (error) throw error;

    // anon: we intentionally do not return the inserted row (no SELECT on SUBMITTED)
    // If you *must* return an id for anon, we can switch to client-generated UUIDs.
    entryId = null;
  }

  // 4) Optional media (login required by default)
  if (mediaState?.show && mediaState.file) {
    if (!userId) {
      // keep this strict to avoid storage/media_files policies for anon
      throw new Error("Please log in to upload media.");
    }
    if (!entryId) {
      throw new Error("Missing entryId for media upload.");
    }

    const { publicUrl } = await uploadToStorage("media_archive", mediaState.file);

    const { error: mediaErr } = await supabase.from("media_files").insert({
      file_name: mediaState.file.name,
      file_type: mediaState.file.type,
      file_url: publicUrl,
      file_size_mb: mediaState.file.size / (1024 * 1024),
      credits: mediaState.credits || null,
      archive_entry_id: entryId, // ✅ correct link column in your schema
    });

    if (mediaErr) throw mediaErr;
  }

  return { id: entryId };
}

/**
 * Updates an existing archive entry.
 * - Uses correct column names (originDate + externalLinks)
 * - Does NOT use media_file_id on archive_entries (doesn't exist in your schema)
 * - Optional media "replacement" is implemented as: upload + insert new row in media_files linked to entryId
 */
export async function updateArchiveEntry({
  entryId,
  form,
  authorState,
  locationState,
  mediaState,
}) {
  if (!entryId) throw new Error("Missing entryId");

  const title = (form.title || "").trim();
  const description = (form.description || "").trim();
  const type = (form.type || "").trim();

  if (!title || !description || !type) {
    throw new Error("Please fill out title, description and type");
  }

  const keywords = parseCommaList(form.keywordsRaw);
  const externalLinks = parseCommaList(form.externalLinksRaw);

  const author_id = authorState?.show
    ? await ensureAuthorId({
        selectedAuthor: authorState.author,
        newAuthor: authorState.newAuthor,
      })
    : null;

  const location_id = locationState?.show
    ? await ensureLocationId({
        selectedLocation: locationState.location,
        newLocation: locationState.newLocation,
      })
    : null;

  // 1) Update archive entry (correct column names)
  const payload = {
    title,
    description,
    type,
    image_url: (form.imageUrl || "").trim() || null,

    keywords,
    originDate: form.originDate || null, // ✅ correct column name
    externalLinks,                       // ✅ correct column name

    status: form.status, // Admin can set

    author_id,
    location_id,
  };

  const { data: updated, error: updErr } = await supabase
    .from("archive_entries")
    .update(payload)
    .eq("id", entryId)
    .select("id,status,title,description,type,image_url,created_at,created_by")
    .single();

  if (updErr) throw updErr;

  // 2) Optional media: upload + insert a new media_files row linked to entryId
  if (mediaState?.show && mediaState.file) {
    const { publicUrl } = await uploadToStorage("media_archive", mediaState.file);

    const { error: mediaErr } = await supabase.from("media_files").insert({
      file_name: mediaState.file.name,
      file_type: mediaState.file.type,
      file_url: publicUrl,
      file_size_mb: mediaState.file.size / (1024 * 1024),
      credits: mediaState.credits || null,
      archive_entry_id: entryId,
    });

    if (mediaErr) throw mediaErr;
  }

  return updated;
}
