import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.status(200).send("Dream AI Server Running");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "dream-ai-server",
    time: new Date().toISOString()
  });
});

app.post("/dream", async (req, res) => {
  try {
    const dream = (req.body?.dream || "").trim();

    if (!dream) {
      return res.status(400).json({
        error: "꿈 내용이 비어 있습니다."
      });
    }

    if (dream.length < 10) {
      return res.status(400).json({
        error: "꿈 내용을 조금 더 자세히 입력해주세요."
      });
    }

    if (dream.length > 3000) {
      return res.status(400).json({
        error: "꿈 내용은 3000자 이하로 입력해주세요."
      });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content:
            "당신은 따뜻하고 통찰력 있는 한국어 꿈 해몽가입니다. " +
            "사용자의 꿈을 읽고 상징, 감정, 현재 심리 흐름을 자연스럽게 해석해 주세요. " +
            "과장되거나 단정하지 말고, 부드럽고 이해하기 쉬운 문장으로 답하세요. " +
            "답변은 다음 흐름을 참고하세요: " +
            "1) 꿈의 전체 분위기 요약 " +
            "2) 핵심 상징 해석 " +
            "3) 감정과 무의식의 의미 " +
            "4) 현실에서 참고할 점. " +
            "너무 짧지 않게, 그러나 불필요하게 장황하지 않게 답하세요."
        },
        {
          role: "user",
          content: dream
        }
      ]
    });

    const result = completion.choices?.[0]?.message?.content?.trim();

    if (!result) {
      return res.status(502).json({
        error: "AI 응답이 비어 있습니다."
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Dream API error:", error);

    return res.status(500).json({
      error: "해몽 처리 중 오류가 발생했습니다."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Dream AI Server listening on port ${PORT}`);
});
