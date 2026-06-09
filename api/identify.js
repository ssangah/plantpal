export const config = {
  api: { bodyParser: false }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.PLANTNET_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    // Forward the multipart form data directly to PlantNet
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = Buffer.concat(chunks)
    const contentType = req.headers['content-type']

    const plantNetRes = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}&lang=en&nb-results=3`,
      {
        method: 'POST',
        headers: { 'content-type': contentType },
        body
      }
    )

    const data = await plantNetRes.json()

    if (!plantNetRes.ok) {
      return res.status(plantNetRes.status).json(data)
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
