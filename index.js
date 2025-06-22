import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();
const CORS_CONFIG = {
  origin: "chrome-extension://folnobifihdhhmoiciceclgemiibfeaf",
  methods: ["POST"],
};

const app = express();
app.use(cors(CORS_CONFIG));
app.use(express.json());

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post(
  "/api/speech",
  (req, res, next) => {
    const authHeader = req.headers["x-extension-secret"];

    if (authHeader !== process.env.EXTENSION_SECRET)
      return res
        .status(403)
        .json({ error: "You do not have permission to access this endpoint." });

    next();
  },
  async (req, res) => {
    const { input } = req.body;

    try {
      const audioData = await openAi.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input,
      });

      const speechArrayBuffer = await audioData.arrayBuffer();

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": speechArrayBuffer.byteLength,
      });

      res.send(Buffer.from(speechArrayBuffer));
    } catch (error) {
      res.status(500).json({
        error:
          "Não foi possível gerar o áudio dos cartões. Tente novamente mais tarde",
      });
    }
  }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
