import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import { colorizeImage } from "./replit_integrations/image/client";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.images.list.path, async (req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  app.get(api.images.get.path, async (req, res) => {
    const image = await storage.getImage(Number(req.params.id));
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  });

  app.post(api.images.upload.path, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const originalBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Create pending record
      const image = await storage.createImage({
        originalUrl: originalBase64,
        status: 'processing',
      });

      // Process in background (but await for MVP simplicity to return result immediately if fast, 
      // or just kick off and return pending. User requirement says "return colored image... with minimal delay".
      // We'll try to await it. If it times out, the client polls.
      // Actually, for better UX with "status" field, let's process async.
      
      (async () => {
        try {
          // Check if it's an image
          if (!req.file) return;

          const base64Data = req.file.buffer.toString('base64');
          const colorizedDataUrl = await colorizeImage(base64Data, req.file.mimetype);
          
          await storage.updateImage(image.id, {
            colorizedUrl: colorizedDataUrl,
            status: 'completed'
          });
        } catch (error: any) {
          console.error("Colorization failed:", error);
          await storage.updateImage(image.id, {
            status: 'failed',
            errorMessage: error.message || "Unknown error"
          });
        }
      })();

      res.status(201).json(image);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Internal server error during upload" });
    }
  });

  return httpServer;
}
