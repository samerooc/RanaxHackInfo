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
