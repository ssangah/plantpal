import { supabase } from './supabaseClient'

const BUCKET = 'plant-photos'

export async function uploadPhoto(file) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `plants/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  // Return the storage path — signed URLs are generated when displaying
  return path
}

// Generate a signed URL valid for 1 year
export async function getSignedUrl(path) {
  if (!path) return null
  // Legacy: already a full URL
  if (path.startsWith('http')) return path

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (error) { console.error('Signed URL error:', error); return null }
  return data.signedUrl
}
