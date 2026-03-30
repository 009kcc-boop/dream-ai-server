import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Dream server is running");
});

app.post("/dream", async (req, res) => {
  try {
    const { dream } = req.body;

    if (!dream || !dream.trim()) {
      return res.status(400).json({
        success: false,
        message: "꿈 내용을 입력해주세요."
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `다음 꿈 내용을 한국어로 친절하고 이해하기 쉽게 해몽해줘.\n\n꿈 내용: ${dream}`
    });

    const result = response.output_text || "해몽 결과를 생성하지 못했습니다.";

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error("Dream API error:", error);
    res.status(500).json({
      success: false,
      message: "서버에서 해몽 결과를 생성하지 못했습니다.",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
