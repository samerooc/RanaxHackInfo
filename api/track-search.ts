import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({ error: "Access key is required" });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    const accessKeys = await sql`
      SELECT * FROM access_keys WHERE key = ${key} LIMIT 1
    `;
    
    if (accessKeys.length === 0) {
      return res.status(401).json({ error: "Invalid access key" });
    }

    const accessKey = accessKeys[0];

    if (accessKey.type === "limited_daily") {
      const today = new Date().toISOString().split('T')[0];
      
      const usage = await sql`
        SELECT * FROM key_usage 
        WHERE key_id = ${accessKey.id} AND search_date = ${today}
        LIMIT 1
      `;
      
      if (usage.length > 0) {
        await sql`
          UPDATE key_usage 
          SET search_count = ${usage[0].search_count + 1}
          WHERE key_id = ${accessKey.id} AND search_date = ${today}
        `;
      } else {
        await sql`
          INSERT INTO key_usage (key_id, search_date, search_count)
          VALUES (${accessKey.id}, ${today}, 1)
        `;
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Track search error:", error);
    res.status(500).json({ error: "Failed to track search" });
  }
}
