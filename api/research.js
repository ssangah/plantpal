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

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      }
    )

    const data = await geminiRes.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
