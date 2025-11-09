import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Number Info API - Proxy to external service
  app.get("/api/number-info/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      
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

  // Family Detail API - Proxy to external service
  app.get("/api/family-detail/:aadhaar", async (req, res) => {
    try {
      const { aadhaar } = req.params;
      
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
