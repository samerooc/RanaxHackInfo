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

export const storage = new MemStorage();
