import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { phoneNumber } = req.query;
    
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ error: "Invalid phone number format. Must be 10 digits." });
    }

    const response = await fetch(`https://numapi.anshapi.workers.dev/?num=${phoneNumber}`);
    
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Invalid response from external API" });
    }

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Number Info API error:", error);
    res.status(503).json({ error: "Unable to reach external API. Please try again later." });
  }
}
