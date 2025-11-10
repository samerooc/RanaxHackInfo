import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const accessKeys = pgTable("access_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  type: text("type").notNull(), // 'unlimited', 'limited_daily', 'permanent'
  maxDailySearches: integer("max_daily_searches"),
  username: text("username"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const keyUsage = pgTable("key_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyId: varchar("key_id").notNull().references(() => accessKeys.id),
  searchDate: date("search_date").notNull(),
  searchCount: integer("search_count").notNull().default(0),
});

export const searchHistory = pgTable("search_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyId: varchar("key_id").notNull().references(() => accessKeys.id),
  searchType: text("search_type").notNull(), // 'number', 'aadhaar'
  searchQuery: text("search_query").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAccessKeySchema = createInsertSchema(accessKeys).pick({
  key: true,
  type: true,
  maxDailySearches: true,
  username: true,
});

export const insertKeyUsageSchema = createInsertSchema(keyUsage).pick({
  keyId: true,
  searchDate: true,
  searchCount: true,
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  keyId: true,
  searchType: true,
  searchQuery: true,
});

export type InsertAccessKey = z.infer<typeof insertAccessKeySchema>;
export type AccessKey = typeof accessKeys.$inferSelect;
export type InsertKeyUsage = z.infer<typeof insertKeyUsageSchema>;
export type KeyUsage = typeof keyUsage.$inferSelect;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type SearchHistory = typeof searchHistory.$inferSelect;
