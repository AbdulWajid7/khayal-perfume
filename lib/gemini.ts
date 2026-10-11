/**
 * Minimal Gemini API client (Google AI Studio key). Server-side only.
 *
 * GEMINI_API_KEY  - required; create one at https://aistudio.google.com/apikey
 * GEMINI_MODEL    - optional; defaults to the current Flash model alias
 *
 * Note: on Google's free tier, prompts and responses may be used by Google to improve its
 * models. Never send phone numbers, addresses or order details to it.
 */

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

interface GenerateOptions {
  system: string;
  turns: GeminiTurn[];
  /** JSON schema (OpenAPI subset) the reply must follow. */
  responseSchema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

/** Returns the model's text, or null when Gemini is not configured, times out or errors. */
export async function geminiGenerate(options: GenerateOptions): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(geminiModel())}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: options.turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxOutputTokens ?? 800,
          ...(options.responseSchema
            ? { responseMimeType: "application/json", responseSchema: options.responseSchema }
            : {}),
        },
      }),
    });
    if (!res.ok) {
      console.error("Gemini error:", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    return text.trim() || null;
  } catch (error) {
    console.error("Gemini request failed:", error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Parses a JSON reply, tolerating a ```json fence around it. */
export function parseJsonReply<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
