import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/speech", async (req, res) => {
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at ${PORT}`));
