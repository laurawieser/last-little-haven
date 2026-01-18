// src/lib/archiveEntries.js
import { supabase } from "./supabase";
import { parseCommaList } from "./formUtils";
import { uploadToStorage, roundMb } from "./media";
import { ensureAuthorId, ensureLocationId } from "./entities";

function fileTypeFromName(name = "") {
  const n = name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "JPG";
  if (n.endsWith(".png")) return "PNG";
  if (n.endsWith(".webp")) return "WEBP";
  throw new Error("Unsupported file type. Please use JPG / PNG / WEBP.");
}

function fileTypeFromUrl(url = "") {
  // strip query/hash
  const clean = url.split("#")[0].split("?")[0];
  return fileTypeFromName(clean);
}

function fileNameFromUrl(url = "") {
  const clean = url.split("#")[0].split("?")[0];
  const parts = clean.split("/");
  const last = parts[parts.length - 1] || "external-image";
  return last;
}

async function demoteExistingCover(entryId) {
  // anon darf kein update -> einfach skippen
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) return;

  const { error } = await supabase
    .from("media_files")
    .update({ role: "ATTACHMENT" })
    .eq("archive_entry_id", entryId)
    .eq("role", "COVER");

  if (error) throw error;
}


async function insertCoverMediaFromUpload({ entryId, file, credits }) {
  await demoteExistingCover(entryId);

  const { publicUrl } = await uploadToStorage("media_archive", file);

  const { error } = await supabase.from("media_files").insert({
    archive_entry_id: entryId,
    role: "COVER",

    file_url: publicUrl,
    file_name: file.name,
    file_type: fileTypeFromName(file.name),
    file_size_mb: roundMb(file.size),
    credits: credits?.trim() || null,
  });

  if (error) throw error;
}

async function insertCoverMediaFromUrl({ entryId, url, credits }) {
  const clean = (url || "").trim();
  if (!clean) throw new Error("Missing image URL.");

  // Wenn du NICHT-nullable file_type hast: hier strikt prüfen
  const file_type = fileTypeFromUrl(clean);

  await demoteExistingCover(entryId);

  const { error } = await supabase.from("media_files").insert({
    archive_entry_id: entryId,
    role: "COVER",

    file_url: clean,
    file_name: fileNameFromUrl(clean),
    file_type,
    file_size_mb: null,                // externe URL -> unbekannt
    credits: credits?.trim() || null,
  });

  if (error) throw error;
}

/**
 * Creates a new archive entry.
 * - Anonymous submissions allowed (created_by can be null)
 * - IMPORTANT: Do NOT use .select() for anon inserts (would require SELECT RLS for SUBMITTED)
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
  const external_links = parseCommaList(form.external_links_raw);

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

  const hasUpload = !!mediaState?.file;
  const externalUrl = (mediaState?.externalUrl || "").trim();
  const hasExternalUrl = mediaState?.mode === "external" && !!externalUrl;


  if (hasUpload && hasExternalUrl) {
    throw new Error("Please either upload a file OR provide an Image URL — not both.");
  }

  const entryId = crypto.randomUUID();

  // 2) Prepare entry payload
  const payload = {
    id: entryId,
    title,
    description,
    type,
    keywords,
    origin_date: form.origin_date || null,
    external_links,

    created_by: userId ?? null,
    status: "SUBMITTED",
    author_id,
    location_id,
  };

  // 3) Insert archive entry
  const { error: entryErr } = await supabase.from("archive_entries").insert(payload);
  if (entryErr) throw entryErr;

  // cover
  if (hasUpload) {
    await insertCoverMediaFromUpload({ entryId, file: mediaState.file, credits: mediaState.credits });
  } else if (hasExternalUrl) {
    await insertCoverMediaFromUrl({ entryId, url: externalUrl, credits: mediaState?.credits });
  }

  return { id: entryId };
}


/**
 * Updates an existing archive entry.
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
  const external_links = parseCommaList(form.external_links_raw);

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

    keywords,
    origin_date: form.origin_date || null,
    external_links,

    status: form.status, // Admin can set

    author_id,
    location_id,
  };

  const { data: updated, error: updErr } = await supabase
    .from("archive_entries")
    .update(payload)
    .eq("id", entryId)
    .select("id,status,title,description,type,created_at,created_by,author_id,location_id,origin_date,external_links,keywords")
    .single();

  if (updErr) throw updErr;

  // 2) Upload cover file
  const hasUpload = !!mediaState?.file;
  const externalUrl = (mediaState?.externalUrl || "").trim();
  const hasExternalUrl = mediaState?.mode === "external" && !!externalUrl;

  if (hasUpload && hasExternalUrl) {
    throw new Error("Please either upload a file OR provide an Image URL — not both.");
  }

  if (hasUpload) {
    await insertCoverMediaFromUpload({
      entryId,
      file: mediaState.file,
      credits: mediaState.credits,
    });
  } else if (hasExternalUrl) {
    await insertCoverMediaFromUrl({
      entryId,
      url: externalUrl,
      credits: mediaState?.credits,
    });
  }


  return updated;
}
