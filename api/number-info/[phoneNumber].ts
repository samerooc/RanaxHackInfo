import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phoneNumber, key } = req.body;
    
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
    if (!key) {
      return res.status(401).json({ error: "Access key is required" });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://YOUR_REPLIT_URL.replit.dev';
    const response = await fetch(`${apiUrl}/api/number-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, key }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Number Info API error:", error);
    res.status(503).json({ error: "Unable to reach external API. Please try again later." });
  }
}
