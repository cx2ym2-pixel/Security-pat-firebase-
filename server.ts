import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example backend API for complex business logic (e.g. verifying scan server-side)
  app.post("/api/verify-patrol", (req, res) => {
    const { qrToken, lat, lng, guardId } = req.body;
    
    // Server-side validation logic: mock for now
    if (!qrToken || !lat || !lng) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Mock distance calculation and fake GPS detection logic
    const distanceToTarget = Math.random() * 100; // Simulated distance in meters
    const isMockLocation = false; // Mock implementation

    if (isMockLocation) {
      return res.status(403).json({ error: "Fake GPS detected. Incident reported." });
    }

    if (distanceToTarget > 50) {
      return res.status(400).json({ error: "Too far from checkpoint." });
    }

    res.json({ 
      success: true, 
      message: "Patrol log recorded securely.",
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
