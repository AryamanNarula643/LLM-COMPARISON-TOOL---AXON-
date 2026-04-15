import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // OpenRouter API Endpoint
  app.post("/api/openrouter", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    try {
      const openai = new OpenAI({ 
        apiKey,
        baseURL: "https://openrouter.ai/api/v1"
      });
      const response = await openai.chat.completions.create({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages: [{ role: "user", content: prompt }],
      });
      res.json({ text: response.choices[0].message.content });
    } catch (error: any) {
      console.error("OpenRouter Error:", error);
      res.status(500).json({ error: error.message || "Failed to call OpenRouter" });
    }
  });

  // Groq API Endpoint
  app.post("/api/groq", async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    }

    try {
      const openai = new OpenAI({ 
        apiKey,
        baseURL: "https://api.groq.com/openai/v1"
      });
      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });
      res.json({ text: response.choices[0].message.content });
    } catch (error: any) {
      console.error("Groq Error:", error);
      res.status(500).json({ error: error.message || "Failed to call Groq" });
    }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
