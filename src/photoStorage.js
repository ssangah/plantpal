import { supabase } from './supabaseClient'

const BUCKET = 'plant-photos'

export async function uploadPhoto(file) {
  const ext = file.name?.split('.').pop() || 'jpg'
  const path = `plants/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  // Return the path — we generate signed URLs when displaying
  return path
}

// Generate a signed URL valid for 1 year
export async function getSignedUrl(path) {
  if (!path) return null
  // Already a full URL (legacy data) — return as-is
  if (path.startsWith('http')) return path

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (error) { console.error('Signed URL error:', error); return null }
  return data.signedUrl
}
