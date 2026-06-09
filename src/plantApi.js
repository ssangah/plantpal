const PLANTNET_API_KEY = process.env.REACT_APP_PLANTNET_API_KEY

// Identify a plant from a base64 image using PlantNet free API
export async function identifyPlant(imageFile) {
  if (!PLANTNET_API_KEY) {
    throw new Error('PLANTNET_API_KEY not set')
  }

  const formData = new FormData()
  formData.append('images', imageFile)
  formData.append('organs', 'leaf')

  const res = await fetch(
    `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&lang=en&nb-results=3`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error(`PlantNet error: ${res.status}`)
  const data = await res.json()

  if (!data.results || data.results.length === 0) {
    throw new Error('No plants identified')
  }

  return data.results.map(r => ({
    commonName: r.species?.commonNames?.[0] || r.species?.scientificNameWithoutAuthor,
    scientificName: r.species?.scientificNameWithoutAuthor,
    confidence: Math.round(r.score * 100),
    family: r.species?.family?.scientificNameWithoutAuthor
  }))
}

// Use Claude AI to research a plant and suggest a watering schedule
export async function researchPlant(plantName) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a plant care expert. Give me a concise care guide for "${plantName}".
        
Respond ONLY with a JSON object — no markdown, no backticks, no preamble:
{
  "commonName": "string",
  "scientificName": "string", 
  "wateringFrequencyDays": number,
  "wateringTip": "one sentence tip on when/how to water",
  "light": "Full sun / Indirect light / Low light",
  "humidity": "Low / Medium / High",
  "difficulty": "Easy / Moderate / Expert",
  "quickTips": ["tip1", "tip2", "tip3"],
  "commonProblems": ["problem1", "problem2"]
}`
      }]
    })
  })

  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    throw new Error('Could not parse plant research')
  }
}
