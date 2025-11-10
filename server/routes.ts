import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Key Verification API
  app.post("/api/verify-key", async (req, res) => {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ error: "Access key is required" });
      }

      const accessKey = await storage.getAccessKeyByKey(key);
      
      if (!accessKey || !accessKey.isActive) {
        return res.status(401).json({ error: "Invalid or inactive access key" });
      }

      const today = new Date().toISOString().split('T')[0];
      
      if (accessKey.type === "limited_daily") {
        const usage = await storage.getKeyUsage(accessKey.id, today);
        const currentCount = usage?.searchCount || 0;
        
        if (currentCount >= (accessKey.maxDailySearches || 10)) {
          return res.status(403).json({ 
            error: "Daily search limit reached",
            limit: accessKey.maxDailySearches,
            used: currentCount
          });
        }
      }

      res.json({
        success: true,
        keyType: accessKey.type,
        maxDailySearches: accessKey.maxDailySearches,
      });
    } catch (error: any) {
      console.error("Key verification error:", error);
      res.status(500).json({ error: "Failed to verify key" });
    }
  });

  // Track Search API
  app.post("/api/track-search", async (req, res) => {
    try {
      const { key } = req.body;
      
      if (!key) {
        return res.status(400).json({ error: "Access key is required" });
      }

      const accessKey = await storage.getAccessKeyByKey(key);
      
      if (!accessKey) {
        return res.status(401).json({ error: "Invalid access key" });
      }

      if (accessKey.type === "limited_daily") {
        const today = new Date().toISOString().split('T')[0];
        const usage = await storage.getKeyUsage(accessKey.id, today);
        
        if (usage) {
          await storage.updateKeyUsageCount(accessKey.id, today, usage.searchCount + 1);
        } else {
          await storage.createKeyUsage({
            keyId: accessKey.id,
            searchDate: today,
            searchCount: 1,
          });
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Search tracking error:", error);
      res.status(500).json({ error: "Failed to track search" });
    }
  });

  // Get All Keys API (Admin endpoint)
  app.get("/api/admin/keys", async (req, res) => {
    try {
      const allKeys = await storage.getAllAccessKeys();
      res.json({ 
        success: true,
        keys: allKeys.map(k => ({
          key: k.key,
          type: k.type,
          maxDailySearches: k.maxDailySearches,
          isActive: k.isActive
        }))
      });
    } catch (error: any) {
      console.error("Failed to fetch keys:", error);
      res.status(500).json({ error: "Failed to fetch keys" });
    }
  });

  // Number Info API - Proxy to external service (Protected)
  app.post("/api/number-info", async (req, res) => {
    try {
      const { phoneNumber, key } = req.body;
      
      // Validate key
      if (!key) {
        return res.status(401).json({ error: "Access key is required" });
      }

      const accessKey = await storage.getAccessKeyByKey(key);
      if (!accessKey || !accessKey.isActive) {
        return res.status(401).json({ error: "Invalid or inactive access key" });
      }

      // Check quota for limited keys
      if (accessKey.type === "limited_daily") {
        const today = new Date().toISOString().split('T')[0];
        const usage = await storage.getKeyUsage(accessKey.id, today);
        const currentCount = usage?.searchCount || 0;
        
        if (currentCount >= (accessKey.maxDailySearches || 10)) {
          return res.status(403).json({ 
            error: "Daily search limit reached. Upgrade to unlimited key for more searches.",
            limit: accessKey.maxDailySearches,
            used: currentCount
          });
        }
        
        // Track this search
        if (usage) {
          await storage.updateKeyUsageCount(accessKey.id, today, currentCount + 1);
        } else {
          await storage.createKeyUsage({
            keyId: accessKey.id,
            searchDate: today,
            searchCount: 1,
          });
        }
      }
      
      // Validate phone number format (10 digits)
      if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: "Invalid phone number format. Must be 10 digits." });
      }

      // Track search history
      await storage.createSearchHistory({
        keyId: accessKey.id,
        searchType: "number",
        searchQuery: phoneNumber,
      });

      const response = await fetch(`https://numapi.anshapi.workers.dev/?num=${phoneNumber}`);
      
      // Forward the actual status code from upstream API
      let data;
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, return as text
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Invalid response from external API" });
      }

      // Forward upstream status and response
      res.status(response.status).json(data);
    } catch (error: any) {
      // Network or fetch errors
      console.error("Number Info API error:", error);
      res.status(503).json({ error: "Unable to reach external API. Please try again later." });
    }
  });

  // Admin: Create new access key
  app.post("/api/admin/keys/create", async (req, res) => {
    try {
      const { type, maxDailySearches, username } = req.body;
      
      if (!type) {
        return res.status(400).json({ error: "Key type is required" });
      }

      const keyLength = type === "limited_daily" ? 20 : 25;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let newKey = '';
      for (let i = 0; i < keyLength; i++) {
        newKey += chars[Math.floor(Math.random() * chars.length)];
      }

      const accessKey = await storage.createAccessKey({
        key: newKey,
        type,
        maxDailySearches: maxDailySearches ?? (type === "limited_daily" ? 10 : null),
        username: username ?? null,
      });

      res.json({ success: true, key: accessKey });
    } catch (error: any) {
      console.error("Failed to create key:", error);
      res.status(500).json({ error: "Failed to create key" });
    }
  });

  // Admin: Update access key
  app.put("/api/admin/keys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { maxDailySearches, username, isActive } = req.body;

      const updates: Partial<any> = {};
      if (maxDailySearches !== undefined) updates.maxDailySearches = maxDailySearches;
      if (username !== undefined) updates.username = username;
      if (isActive !== undefined) updates.isActive = isActive;

      await storage.updateAccessKey(id, updates);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to update key:", error);
      res.status(500).json({ error: "Failed to update key" });
    }
  });

  // Admin: Delete access key
  app.delete("/api/admin/keys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAccessKey(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete key:", error);
      res.status(500).json({ error: "Failed to delete key" });
    }
  });

  // Admin: Get all keys with usage stats
  app.get("/api/admin/keys/detailed", async (req, res) => {
    try {
      const allKeys = await storage.getAllAccessKeys();
      const today = new Date().toISOString().split('T')[0];
      
      const keysWithUsage = await Promise.all(
        allKeys.map(async (key) => {
          const usage = await storage.getKeyUsage(key.id, today);
          const searchHistory = await storage.getSearchHistoryByKeyId(key.id);
          
          return {
            ...key,
            todayUsage: usage?.searchCount || 0,
            remaining: key.type === "limited_daily" 
              ? (key.maxDailySearches || 10) - (usage?.searchCount || 0)
              : null,
            totalSearches: searchHistory.length,
          };
        })
      );

      res.json({ success: true, keys: keysWithUsage });
    } catch (error: any) {
      console.error("Failed to fetch detailed keys:", error);
      res.status(500).json({ error: "Failed to fetch keys" });
    }
  });

  // Admin: Get search history
  app.get("/api/admin/search-history", async (req, res) => {
    try {
      const allHistory = await storage.getAllSearchHistory();
      const allKeys = await storage.getAllAccessKeys();
      
      const historyWithDetails = allHistory.map((history) => {
        const key = allKeys.find(k => k.id === history.keyId);
        return {
          ...history,
          keyValue: key?.key,
          username: key?.username,
          keyType: key?.type,
        };
      });

      res.json({ success: true, history: historyWithDetails });
    } catch (error: any) {
      console.error("Failed to fetch search history:", error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  // Family Detail API - Proxy to external service (Protected)
  app.post("/api/family-detail", async (req, res) => {
    try {
      const { aadhaar, key } = req.body;
      
      // Validate key
      if (!key) {
        return res.status(401).json({ error: "Access key is required" });
      }

      const accessKey = await storage.getAccessKeyByKey(key);
      if (!accessKey || !accessKey.isActive) {
        return res.status(401).json({ error: "Invalid or inactive access key" });
      }

      // Check quota for limited keys
      if (accessKey.type === "limited_daily") {
        const today = new Date().toISOString().split('T')[0];
        const usage = await storage.getKeyUsage(accessKey.id, today);
        const currentCount = usage?.searchCount || 0;
        
        if (currentCount >= (accessKey.maxDailySearches || 10)) {
          return res.status(403).json({ 
            error: "Daily search limit reached. Upgrade to unlimited key for more searches.",
            limit: accessKey.maxDailySearches,
            used: currentCount
          });
        }
        
        // Track this search
        if (usage) {
          await storage.updateKeyUsageCount(accessKey.id, today, currentCount + 1);
        } else {
          await storage.createKeyUsage({
            keyId: accessKey.id,
            searchDate: today,
            searchCount: 1,
          });
        }
      }
      
      // Validate Aadhaar format (12 digits)
      if (!/^\d{12}$/.test(aadhaar)) {
        return res.status(400).json({ error: "Invalid Aadhaar format. Must be 12 digits." });
      }

      // Track search history
      await storage.createSearchHistory({
        keyId: accessKey.id,
        searchType: "aadhaar",
        searchQuery: aadhaar,
      });

      const response = await fetch(`https://addartofamily.vercel.app/fetch?aadhaar=${aadhaar}&key=fxt`);
      
      // Forward the actual status code from upstream API
      let data;
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, return as text
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Invalid response from external API" });
      }

      // Forward upstream status and response
      res.status(response.status).json(data);
    } catch (error: any) {
      // Network or fetch errors
      console.error("Family Detail API error:", error);
      res.status(503).json({ error: "Unable to reach external API. Please try again later." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
