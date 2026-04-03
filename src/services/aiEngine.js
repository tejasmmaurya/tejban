const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildSystemPrompt, buildUserPrompt } = require("./promptBuilder");
const { buildMockBlueprint } = require("../utils/mockBlueprint");

// Fallback chain — tried in order until one succeeds
const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-2.5-flash-preview-tts"
];

function isQuotaError(err) {
  const msg = String(err?.message || "");
  return msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests") || msg.includes("RESOURCE_EXHAUSTED");
}

function tryParseJson(text) {
  try {
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function generateStartupBlueprint(input) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildMockBlueprint(input);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Allow override via env, otherwise rotate through the chain
  const envModel = process.env.GEMINI_MODEL;
  const models = envModel ? [envModel, ...MODEL_CHAIN.filter(m => m !== envModel)] : MODEL_CHAIN;

  let lastErr = null;
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(),
        generationConfig: { temperature: 0.5 }
      });

      const result = await model.generateContent(buildUserPrompt(input));
      const content = result.response.text();
      const parsed = tryParseJson(content);

      if (!parsed) {
        return {
          ...buildMockBlueprint(input),
          meta: {
            generatedAt: new Date().toISOString(),
            mode: "fallback",
            summary: `AI response was not valid JSON (model: ${modelName}); showing demo blueprint.`
          }
        };
      }

      return {
        meta: {
          generatedAt: new Date().toISOString(),
          mode: "live-ai",
          model: modelName,
          summary: `Generated with Gemini (${modelName})`
        },
        ...parsed
      };
    } catch (err) {
      if (isQuotaError(err)) {
        lastErr = err;
        continue; // try next model
      }
      throw err;
    }
  }

  // All models exhausted
  return {
    ...buildMockBlueprint(input),
    meta: {
      generatedAt: new Date().toISOString(),
      mode: "fallback",
      summary: "All Gemini models are currently rate-limited. Showing demo blueprint. Try again in a minute or enable billing at https://ai.google.dev/gemini-api/docs/rate-limits"
    }
  };
}

module.exports = { generateStartupBlueprint };
