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
      SELECT * FROM access_keys WHERE key = ${key} AND is_active = true LIMIT 1
    `;
    
    if (accessKeys.length === 0) {
      return res.status(401).json({ error: "Invalid or inactive access key" });
    }

    const accessKey = accessKeys[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (accessKey.type === "limited_daily") {
      const usage = await sql`
        SELECT * FROM key_usage 
        WHERE key_id = ${accessKey.id} AND search_date = ${today}
        LIMIT 1
      `;
      
      const currentCount = usage.length > 0 ? usage[0].search_count : 0;
      
      if (currentCount >= (accessKey.max_daily_searches || 10)) {
        return res.status(403).json({ 
          error: "Daily search limit reached",
          limit: accessKey.max_daily_searches,
          used: currentCount
        });
      }
    }

    res.json({
      success: true,
      keyType: accessKey.type,
      maxDailySearches: accessKey.max_daily_searches,
    });
  } catch (error: any) {
    console.error("Key verification error:", error);
    res.status(500).json({ error: "Failed to verify key" });
  }
}
