// Identify a plant — routes through /api/identify to avoid CORS issues
export async function identifyPlant(imageFile) {
  const formData = new FormData()
  formData.append('images', imageFile)
  formData.append('organs', 'leaf')

  const res = await fetch('/api/identify', {
    method: 'POST',
    body: formData
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error: ${res.status}`)
  }

  const data = await res.json()
  if (!data.results || data.results.length === 0) {
    throw new Error('No plants identified — try a clearer photo of a leaf')
  }

  return data.results.map(r => ({
    commonName: r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor,
    scientificName: r.species?.scientificNameWithoutAuthor,
    confidence: Math.round(r.score * 100),
    family: r.species?.family?.scientificNameWithoutAuthor
  }))
}

// Research a plant via Gemini (server-side proxy keeps API key secret)
export async function researchPlant(plantName) {
  const res = await fetch('/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plantName })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Error: ${res.status}`)
  }

  return res.json()
}
