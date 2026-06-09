// Identify a plant from an image file via PlantNet
export async function identifyPlant(imageFile) {
  const apiKey = process.env.REACT_APP_PLANTNET_API_KEY
  const formData = new FormData()
  formData.append('images', imageFile)
  formData.append('organs', 'leaf')

  const res = await fetch(
    `https://api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=en&nb-results=3`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error(`PlantNet error: ${res.status}`)
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
