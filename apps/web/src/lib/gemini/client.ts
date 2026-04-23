export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "DUMMY_API_KEY";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    throw new GeminiError(
      `Gemini API error: ${response.status} ${response.statusText}`,
      "GEMINI_API_ERROR"
    );
  }

  const data = await response.json();

  const finishReason: string | undefined = data?.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    throw new GeminiError("Response was truncated", "TRUNCATED_RESPONSE");
  }

  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text || text.trim() === "" || text.trim() === "null") {
    throw new GeminiError("Player not found", "PLAYER_NOT_FOUND");
  }

  return text;
}
