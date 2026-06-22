import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/doubt-solver", async (req, res) => {
    try {
      const { question } = req.body;
      if (!question) {
        return res.status(400).json({ error: "Question is required." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
        config: {
          systemInstruction: "You are an expert AI tutor. Provide a clear, step-by-step explanation to the student's question. Use markdown formatting for readability. Keep it concise but comprehensive."
        }
      });

      res.json({ answer: response.text });
    } catch (error: any) {
      console.error("Doubt Solver Error:", error);
      res.status(500).json({ error: "Failed to generate answer." });
    }
  });

  app.post("/api/study-planner", async (req, res) => {
    try {
      const { examName, examDate, hoursPerDay, weakTopics, strongTopics } = req.body;
      
      const prompt = `Create a study plan for the following:
      Exam: ${examName}
      Date: ${examDate}
      Hours/Day: ${hoursPerDay}
      Weak Topics: ${weakTopics}
      Strong Topics: ${strongTopics}
      
      Output a structured daily plan with tasks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert AI study planner. Generate a targeted, practical study schedule based on the provided inputs.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: "A brief summary of the strategy." },
              dailyRoutine: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING, description: "e.g., 'Day 1', 'Monday'" },
                    focus: { type: Type.STRING, description: "Main focus topic" },
                    tasks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            required: ["summary", "dailyRoutine"]
          }
        }
      });

      res.json({ plan: JSON.parse(response.text || "{}") });
    } catch (error: any) {
      console.error("Study Planner Error:", error);
      res.status(500).json({ error: "Failed to generate plan." });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
