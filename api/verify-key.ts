import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import { pgTable, text, varchar, integer, boolean, timestamp, date } from 'drizzle-orm/pg-core';
import { sql as drizzleSql } from 'drizzle-orm';

const accessKeys = pgTable("access_keys", {
  id: varchar("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  type: text("type").notNull(),
  maxDailySearches: integer("max_daily_searches"),
  username: text("username"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const keyUsage = pgTable("key_usage", {
  id: varchar("id").primaryKey().default(drizzleSql`gen_random_uuid()`),
  keyId: varchar("key_id").notNull(),
  searchDate: date("search_date").notNull(),
  searchCount: integer("search_count").notNull().default(0),
});

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

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    const results = await db.select().from(accessKeys)
      .where(and(eq(accessKeys.key, key), eq(accessKeys.isActive, true)))
      .limit(1);
    
    if (results.length === 0) {
      await pool.end();
      return res.status(401).json({ error: "Invalid or inactive access key" });
    }

    const accessKey = results[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (accessKey.type === "limited_daily") {
      const usageResults = await db.select().from(keyUsage)
        .where(and(eq(keyUsage.keyId, accessKey.id), eq(keyUsage.searchDate, today)))
        .limit(1);
      
      const currentCount = usageResults.length > 0 ? usageResults[0].searchCount : 0;
      
      if (currentCount >= (accessKey.maxDailySearches || 10)) {
        await pool.end();
        return res.status(403).json({ 
          error: "Daily search limit reached",
          limit: accessKey.maxDailySearches,
          used: currentCount
        });
      }
    }

    await pool.end();
    res.json({
      success: true,
      keyType: accessKey.type,
      maxDailySearches: accessKey.maxDailySearches,
    });
  } catch (error: any) {
    console.error("Key verification error:", error);
    res.status(500).json({ error: "Failed to verify key" });
  }
}
