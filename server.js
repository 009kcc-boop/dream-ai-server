import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function cleanText(value) {
  return String(value || "").trim();
}

async function askOpenAI(systemPrompt, userPrompt) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4",
    input: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  });

  const text = cleanText(response.output_text);
  if (!text) {
    throw new Error("응답 결과가 비어 있습니다.");
  }
  return text;
}

app.get("/", (req, res) => {
  res.send("AI아하 통합 상담 서버가 실행 중입니다.");
});

/* =========================
   1. 꿈해몽
   기존 /dream 유지
========================= */
app.post("/dream", async (req, res) => {
  try {
    const dream = cleanText(req.body?.dream);

    if (!dream) {
      return res.status(400).json({
        error: "꿈 내용이 없습니다."
      });
    }

    const systemPrompt = `
당신은 한국어로 답하는 따뜻하고 실용적인 꿈해몽 전문가입니다.
과장하거나 무섭게 몰아가지 말고, 상징과 감정을 중심으로 해석하세요.

답변 형식:
1. 꿈의 핵심 분위기
2. 상징 해석
3. 현재 마음 상태 추정
4. 현실 조언

문장은 부드럽고 읽기 쉽게 작성하세요.
`;

    const userPrompt = `
다음 꿈을 해몽해주세요.

[꿈 내용]
${dream}
`;

    const result = await askOpenAI(systemPrompt, userPrompt);

    res.json({ result });
  } catch (error) {
    console.error("dream error:", error);
    res.status(500).json({
      error: error?.message || "꿈해몽 처리 중 오류가 발생했습니다."
    });
  }
});

/* =========================
   2. 사주
========================= */
app.post("/saju", async (req, res) => {
  try {
    const name = cleanText(req.body?.name);
    const gender = cleanText(req.body?.gender);
    const birth = cleanText(req.body?.birth);
    const calendar = cleanText(req.body?.calendar);
    const time = cleanText(req.body?.time);
    const question = cleanText(req.body?.question);

    if (!name || !gender || !birth || !calendar) {
      return res.status(400).json({
        error: "이름, 성별, 생년월일, 양력/음력은 꼭 입력해주세요."
      });
    }

    const systemPrompt = `
당신은 한국어로 답하는 친절한 사주 상담 도우미입니다.
사주 결과는 재미와 참고용 해석으로 제공하며, 지나치게 단정하거나 겁을 주는 표현은 피하세요.
운명 확정처럼 말하지 말고 흐름과 성향 중심으로 설명하세요.

답변 형식:
1. 전체 흐름 요약
2. 성향 및 기질
3. 가까운 시기의 흐름
4. 금전 / 건강 / 대인관계 조언
5. 한 줄 조언

부드럽고 쉽게 읽히게 작성하세요.
`;

    const userPrompt = `
다음 정보를 바탕으로 사주 흐름을 정리해주세요.

이름: ${name}
성별: ${gender}
생년월일: ${birth}
양력/음력: ${calendar}
태어난 시간: ${time || "모름"}
궁금한 점: ${question || "전반적인 흐름"}
`;

    const result = await askOpenAI(systemPrompt, userPrompt);

    res.json({ result });
  } catch (error) {
    console.error("saju error:", error);
    res.status(500).json({
      error: error?.message || "사주 처리 중 오류가 발생했습니다."
    });
  }
});

/* =========================
   3. 오늘의 운세
========================= */
app.post("/fortune", async (req, res) => {
  try {
    const name = cleanText(req.body?.name);
    const birth = cleanText(req.body?.birth);
    const question = cleanText(req.body?.question);

    if (!name || !birth) {
      return res.status(400).json({
        error: "이름과 생년월일은 꼭 입력해주세요."
      });
    }

    const systemPrompt = `
당신은 한국어로 답하는 밝고 실용적인 오늘의 운세 상담 도우미입니다.
결과는 가볍게 참고하는 톤으로 작성하고, 과장하거나 단정적인 예언처럼 쓰지 마세요.

답변 형식:
1. 오늘의 전체 흐름
2. 금전운
3. 대인운
4. 주의할 점
5. 행운 포인트(색상, 시간대, 한 줄 팁)

짧고 보기 쉽게 정리하세요.
`;

    const userPrompt = `
다음 정보를 바탕으로 오늘의 운세를 알려주세요.

이름: ${name}
생년월일: ${birth}
궁금한 점: ${question || "오늘 하루 전반적인 흐름"}
`;

    const result = await askOpenAI(systemPrompt, userPrompt);

    res.json({ result });
  } catch (error) {
    console.error("fortune error:", error);
    res.status(500).json({
      error: error?.message || "오늘의 운세 처리 중 오류가 발생했습니다."
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
