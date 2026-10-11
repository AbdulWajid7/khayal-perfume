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
/** Faster, lighter model for live WhatsApp replies. */
export const DEFAULT_GEMINI_CHAT_MODEL = "gemini-flash-lite-latest";
/** "Nano Banana" image model. */
export const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function geminiChatModel(): string {
  return process.env.GEMINI_CHAT_MODEL?.trim() || DEFAULT_GEMINI_CHAT_MODEL;
}

export function geminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}

export interface GeminiTurn {
  role: "user" | "model";
  text: string;
}

interface GenerateOptions {
  /** Defaults to GEMINI_MODEL. */
  model?: string;
  /** Lets the model search Google for current information (cannot be combined with responseSchema). */
  googleSearch?: boolean;
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
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(options.model || geminiModel())}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: options.system }] },
        contents: options.turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        ...(options.googleSearch ? { tools: [{ google_search: {} }] } : {}),
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxOutputTokens ?? 2048,
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

/** Parses a JSON reply, tolerating a ```json fence or text around it. */
export function parseJsonReply<T>(raw: string | null): T | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.search(/[[{]/);
    const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

/** Generates one image with the Gemini image model. Returns null when unavailable (no key, quota, error). */
export async function geminiImage(
  prompt: string,
  options: { aspectRatio?: string; timeoutMs?: number } = {}
): Promise<{ mimeType: string; data: Buffer } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 25000);
  try {
    const res = await fetch(`${ENDPOINT}/${encodeURIComponent(geminiImageModel())}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: options.aspectRatio || "16:9" },
        },
      }),
    });
    if (!res.ok) {
      console.error("Gemini image error:", res.status, (await res.text()).slice(0, 300));
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
    };
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part?.inlineData?.data) return null;
    return { mimeType: part.inlineData.mimeType || "image/png", data: Buffer.from(part.inlineData.data, "base64") };
  } catch (error) {
    console.error("Gemini image request failed:", error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
