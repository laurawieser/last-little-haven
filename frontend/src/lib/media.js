import { supabase } from "./supabase";

export function roundMb(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

export async function uploadToStorage(bucket, file) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `entries/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export async function insertMediaRow({ file, fileUrl, credits }) {
  const { data, error } = await supabase
    .from("media_files")
    .insert({
      file_name: file.name,
      file_type: file.type || "unknown",
      file_url: fileUrl,
      file_size_mb: roundMb(file.size),
      credits: credits?.trim() || null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
