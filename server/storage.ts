import { type User, type InsertUser, type AccessKey, type InsertAccessKey, type KeyUsage, type InsertKeyUsage, type SearchHistory, type InsertSearchHistory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAccessKeyByKey(key: string): Promise<AccessKey | undefined>;
  getAccessKeyById(id: string): Promise<AccessKey | undefined>;
  createAccessKey(key: InsertAccessKey): Promise<AccessKey>;
  updateAccessKey(id: string, updates: Partial<AccessKey>): Promise<void>;
  deleteAccessKey(id: string): Promise<void>;
  getAllAccessKeys(): Promise<AccessKey[]>;
  
  getKeyUsage(keyId: string, date: string): Promise<KeyUsage | undefined>;
  createKeyUsage(usage: InsertKeyUsage): Promise<KeyUsage>;
  updateKeyUsageCount(keyId: string, date: string, count: number): Promise<void>;
  
  createSearchHistory(history: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistoryByKeyId(keyId: string): Promise<SearchHistory[]>;
  getAllSearchHistory(): Promise<SearchHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accessKeys: Map<string, AccessKey>;
  private keyUsages: Map<string, KeyUsage>;
  private searchHistories: Map<string, SearchHistory>;

  constructor() {
    this.users = new Map();
    this.accessKeys = new Map();
    this.keyUsages = new Map();
    this.searchHistories = new Map();
    this.initializeKeys();
  }

  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      key += chars[randomIndex];
    }
    return key;
  }

  private initializeKeys() {
    const masterKey: AccessKey = {
      id: randomUUID(),
      key: this.generateRandomKey(25),
      type: "unlimited",
      maxDailySearches: null,
      username: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(masterKey.key, masterKey);

    const permanentKey: AccessKey = {
      id: randomUUID(),
      key: this.generateRandomKey(25),
      type: "permanent",
      maxDailySearches: null,
      username: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(permanentKey.key, permanentKey);

    for (let i = 1; i <= 100; i++) {
      const limitedKey: AccessKey = {
        id: randomUUID(),
        key: this.generateRandomKey(20),
        type: "limited_daily",
        maxDailySearches: 10,
        username: null,
        isActive: true,
        createdAt: new Date(),
      };
      this.accessKeys.set(limitedKey.key, limitedKey);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAccessKeyByKey(key: string): Promise<AccessKey | undefined> {
    return this.accessKeys.get(key);
  }

  async getAccessKeyById(id: string): Promise<AccessKey | undefined> {
    return Array.from(this.accessKeys.values()).find((key) => key.id === id);
  }

  async createAccessKey(insertKey: InsertAccessKey): Promise<AccessKey> {
    const id = randomUUID();
    const accessKey: AccessKey = {
      id,
      key: insertKey.key,
      type: insertKey.type,
      maxDailySearches: insertKey.maxDailySearches ?? null,
      username: insertKey.username ?? null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(accessKey.key, accessKey);
    return accessKey;
  }

  async updateAccessKey(id: string, updates: Partial<AccessKey>): Promise<void> {
    const key = await this.getAccessKeyById(id);
    if (key) {
      const updated = { ...key, ...updates };
      this.accessKeys.delete(key.key);
      this.accessKeys.set(updated.key, updated);
    }
  }

  async deleteAccessKey(id: string): Promise<void> {
    const key = await this.getAccessKeyById(id);
    if (key) {
      this.accessKeys.delete(key.key);
    }
  }

  async getAllAccessKeys(): Promise<AccessKey[]> {
    return Array.from(this.accessKeys.values());
  }

  async getKeyUsage(keyId: string, date: string): Promise<KeyUsage | undefined> {
    const usageKey = `${keyId}-${date}`;
    return this.keyUsages.get(usageKey);
  }

  async createKeyUsage(insertUsage: InsertKeyUsage): Promise<KeyUsage> {
    const id = randomUUID();
    const usage: KeyUsage = {
      id,
      keyId: insertUsage.keyId,
      searchDate: insertUsage.searchDate,
      searchCount: insertUsage.searchCount ?? 0,
    };
    const usageKey = `${usage.keyId}-${usage.searchDate}`;
    this.keyUsages.set(usageKey, usage);
    return usage;
  }

  async updateKeyUsageCount(keyId: string, date: string, count: number): Promise<void> {
    const usageKey = `${keyId}-${date}`;
    const existing = this.keyUsages.get(usageKey);
    if (existing) {
      this.keyUsages.set(usageKey, { ...existing, searchCount: count });
    }
  }

  async createSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = randomUUID();
    const history: SearchHistory = {
      id,
      keyId: insertHistory.keyId,
      searchType: insertHistory.searchType,
      searchQuery: insertHistory.searchQuery,
      timestamp: new Date(),
    };
    this.searchHistories.set(id, history);
    return history;
  }

  async getSearchHistoryByKeyId(keyId: string): Promise<SearchHistory[]> {
    return Array.from(this.searchHistories.values()).filter(
      (h) => h.keyId === keyId
    );
  }

  async getAllSearchHistory(): Promise<SearchHistory[]> {
    return Array.from(this.searchHistories.values());
  }
}

import { db } from './db';
import { eq, and } from 'drizzle-orm';
import { users, accessKeys, keyUsage, searchHistory } from '@shared/schema';
import * as bcrypt from 'bcryptjs';

export class DbStorage implements IStorage {
  private initialized = false;

  async init() {
    if (this.initialized) return;
    
    const existingKeys = await db.select().from(accessKeys);
    
    if (existingKeys.length === 0) {
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      await db.insert(users).values({
        username: 'admin',
        password: hashedPassword,
        isAdmin: true,
      });

      const masterKey: InsertAccessKey = {
        key: this.generateRandomKey(25),
        type: "unlimited",
        maxDailySearches: null,
        username: "MASTER_KEY",
      };
      await db.insert(accessKeys).values(masterKey);

      const permanentKey: InsertAccessKey = {
        key: this.generateRandomKey(25),
        type: "permanent",
        maxDailySearches: null,
        username: "PERMANENT_KEY",
      };
      await db.insert(accessKeys).values(permanentKey);

      const limitedKeys: InsertAccessKey[] = [];
      for (let i = 1; i <= 100; i++) {
        limitedKeys.push({
          key: this.generateRandomKey(20),
          type: "limited_daily",
          maxDailySearches: 10,
          username: null,
        });
      }
      await db.insert(accessKeys).values(limitedKeys);
    }
    
    this.initialized = true;
  }

  private generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      key += chars[randomIndex];
    }
    return key;
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAccessKeyByKey(key: string): Promise<AccessKey | undefined> {
    const result = await db.select().from(accessKeys).where(eq(accessKeys.key, key)).limit(1);
    return result[0];
  }

  async getAccessKeyById(id: string): Promise<AccessKey | undefined> {
    const result = await db.select().from(accessKeys).where(eq(accessKeys.id, id)).limit(1);
    return result[0];
  }

  async createAccessKey(insertKey: InsertAccessKey): Promise<AccessKey> {
    const result = await db.insert(accessKeys).values(insertKey).returning();
    return result[0];
  }

  async updateAccessKey(id: string, updates: Partial<AccessKey>): Promise<void> {
    await db.update(accessKeys).set(updates).where(eq(accessKeys.id, id));
  }

  async deleteAccessKey(id: string): Promise<void> {
    await db.delete(accessKeys).where(eq(accessKeys.id, id));
  }

  async getAllAccessKeys(): Promise<AccessKey[]> {
    return db.select().from(accessKeys);
  }

  async getKeyUsage(keyId: string, date: string): Promise<KeyUsage | undefined> {
    const result = await db.select().from(keyUsage)
      .where(and(eq(keyUsage.keyId, keyId), eq(keyUsage.searchDate, date)))
      .limit(1);
    return result[0];
  }

  async createKeyUsage(insertUsage: InsertKeyUsage): Promise<KeyUsage> {
    const result = await db.insert(keyUsage).values(insertUsage).returning();
    return result[0];
  }

  async updateKeyUsageCount(keyId: string, date: string, count: number): Promise<void> {
    await db.update(keyUsage)
      .set({ searchCount: count })
      .where(and(eq(keyUsage.keyId, keyId), eq(keyUsage.searchDate, date)));
  }

  async createSearchHistory(insertHistory: InsertSearchHistory): Promise<SearchHistory> {
    const result = await db.insert(searchHistory).values(insertHistory).returning();
    return result[0];
  }

  async getSearchHistoryByKeyId(keyId: string): Promise<SearchHistory[]> {
    return db.select().from(searchHistory).where(eq(searchHistory.keyId, keyId));
  }

  async getAllSearchHistory(): Promise<SearchHistory[]> {
    return db.select().from(searchHistory);
  }
}

const dbStorage = new DbStorage();
dbStorage.init().catch(console.error);

export const storage = dbStorage;
