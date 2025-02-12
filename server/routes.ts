import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  app.post('/api/compare', (req, res) => {
    const { original, translated } = req.body;
    
    if (!original || !translated) {
      return res.status(400).json({ error: 'Missing required files' });
    }

    // Simple validation of text content
    if (typeof original !== 'string' || typeof translated !== 'string') {
      return res.status(400).json({ error: 'Invalid file content' });
    }

    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
