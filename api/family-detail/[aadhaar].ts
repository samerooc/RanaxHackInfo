import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { aadhaar } = req.query;
    
    if (!aadhaar || typeof aadhaar !== 'string') {
      return res.status(400).json({ error: "Aadhaar number is required" });
    }
    
    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ error: "Invalid Aadhaar format. Must be 12 digits." });
    }

    const response = await fetch(`https://addartofamily.vercel.app/fetch?aadhaar=${aadhaar}&key=fxt`);
    
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Invalid response from external API" });
    }

    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("Family Detail API error:", error);
    res.status(503).json({ error: "Unable to reach external API. Please try again later." });
  }
}
