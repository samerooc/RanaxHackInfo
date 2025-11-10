import { type User, type InsertUser, type AccessKey, type InsertAccessKey, type KeyUsage, type InsertKeyUsage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAccessKeyByKey(key: string): Promise<AccessKey | undefined>;
  createAccessKey(key: InsertAccessKey): Promise<AccessKey>;
  getAllAccessKeys(): Promise<AccessKey[]>;
  
  getKeyUsage(keyId: string, date: string): Promise<KeyUsage | undefined>;
  createKeyUsage(usage: InsertKeyUsage): Promise<KeyUsage>;
  updateKeyUsageCount(keyId: string, date: string, count: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private accessKeys: Map<string, AccessKey>;
  private keyUsages: Map<string, KeyUsage>;

  constructor() {
    this.users = new Map();
    this.accessKeys = new Map();
    this.keyUsages = new Map();
    this.initializeKeys();
  }

  private initializeKeys() {
    const masterKey: AccessKey = {
      id: randomUUID(),
      key: "MASTER-UNLIMITED-2024",
      type: "unlimited",
      maxDailySearches: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(masterKey.key, masterKey);

    const permanentKey: AccessKey = {
      id: randomUUID(),
      key: "PERMANENT-ACCESS-2024",
      type: "permanent",
      maxDailySearches: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(permanentKey.key, permanentKey);

    for (let i = 1; i <= 100; i++) {
      const limitedKey: AccessKey = {
        id: randomUUID(),
        key: `LIMITED-${String(i).padStart(3, '0')}-2024`,
        type: "limited_daily",
        maxDailySearches: 10,
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

  async createAccessKey(insertKey: InsertAccessKey): Promise<AccessKey> {
    const id = randomUUID();
    const accessKey: AccessKey = {
      id,
      key: insertKey.key,
      type: insertKey.type,
      maxDailySearches: insertKey.maxDailySearches ?? null,
      isActive: true,
      createdAt: new Date(),
    };
    this.accessKeys.set(accessKey.key, accessKey);
    return accessKey;
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
}

export const storage = new MemStorage();
