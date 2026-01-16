import { supabase } from "./supabase";
import { parseCommaList } from "./formUtils";
import { uploadToStorage, insertMediaRow } from "./media";
import { ensureAuthorId, ensureLocationId } from "./entities";

export async function createArchiveEntry({
    userId,
    form,
    authorState,
    locationState,
    mediaState,
}) {
    if (!userId) throw new Error("Not logged in.");

    const title = (form.title || "").trim();
    const description = (form.description || "").trim();
    const type = (form.type || "").trim();

    if (!title || !description || !type) {
        throw new Error("Please fill out title, description and type");
    }

    const keywords = parseCommaList(form.keywordsRaw);
    const external_links = parseCommaList(form.externalLinksRaw);

    // 1) optional relations
    const author_id = authorState.show
        ? await ensureAuthorId({
            selectedAuthor: authorState.author,
            newAuthor: authorState.newAuthor,
        })
        : null;

    const location_id = locationState.show
        ? await ensureLocationId({
            selectedLocation: locationState.location,
            newLocation: locationState.newLocation,
        })
        : null;

    // 2) optional media
    let media_file_id = null;
    if (mediaState.show && mediaState.file) {
        const { publicUrl } = await uploadToStorage("media_archive", mediaState.file);
        media_file_id = await insertMediaRow({
            file: mediaState.file,
            fileUrl: publicUrl,
            credits: mediaState.credits,
        });
    }

    // 3) insert archive entry
    const payload = {
        title,
        description,
        type,
        image_url: (form.imageUrl || "").trim() || null,

        keywords,
        origin_date: form.originDate || null,
        external_links,

        created_by: userId,
        status: "SUBMITTED",

        author_id,
        location_id,
        media_file_id,
    };

    const { data, error } = await supabase
        .from("archive_entries")
        .insert(payload)
        .select("id")
        .single();

    if (error) throw error;
    return data; // { id }
}


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
    const external_links = parseCommaList(form.externalLinksRaw);

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

    let media_file_id = form.media_file_id ?? null;

    // optional: replace media
    if (mediaState?.show && mediaState.file) {
        const { publicUrl } = await uploadToStorage("media_archive", mediaState.file);
        media_file_id = await insertMediaRow({
            file: mediaState.file,
            fileUrl: publicUrl,
            credits: mediaState.credits,
        });
    }

    const payload = {
        title,
        description,
        type,
        image_url: (form.imageUrl || "").trim() || null,

        keywords,
        origin_date: form.originDate || null,
        external_links,

        status: form.status, // Admin can set

        author_id,
        location_id,
        media_file_id,
    };

    const { data, error } = await supabase
        .from("archive_entries")
        .update(payload)
        .eq("id", entryId)
        .select("id,status,title,description,type,image_url,created_at,created_by")
        .single();

    if (error) throw error;
    return data;
}
