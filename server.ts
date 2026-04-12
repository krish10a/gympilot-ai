import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GymPilot AI Backend is running" });
  });

  // Mock API for User Profile
  app.get("/api/profile/:uid", (req, res) => {
    res.json({
      uid: req.params.uid,
      displayName: "Krish Pandya",
      onboarded: true,
      goal: "cut",
      activityLevel: "moderate"
    });
  });

  // Mock API for Nutrition Logs
  app.post("/api/nutrition/log", (req, res) => {
    const { items, totalCalories } = req.body;
    console.log("Logging meal:", items);
    res.json({ success: true, id: Math.random().toString(36).substr(2, 9) });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GymPilot AI running on http://localhost:${PORT}`);
  });
}

startServer();
