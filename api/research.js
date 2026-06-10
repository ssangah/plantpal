export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' })
  }

  try {
    const { plantName } = await new Promise((resolve, reject) => {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => { try { resolve(JSON.parse(body)) } catch { reject(new Error('Invalid JSON')) } })
    })

    const prompt = `You are a plant care expert. Give me a concise care guide for "${plantName}".

You MUST respond with only a raw JSON object. No markdown, no code fences, no backticks, no explanation before or after. Start your response with { and end with }.

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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data.error?.message || 'Gemini error' })
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Strip any markdown fences Gemini might add despite instructions
    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    // Extract JSON object even if there's stray text around it
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('Gemini raw response:', raw)
      return res.status(500).json({ error: 'Could not parse plant data' })
    }

    const parsed = JSON.parse(match[0])
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Research error:', err)
    return res.status(500).json({ error: err.message })
  }
}
