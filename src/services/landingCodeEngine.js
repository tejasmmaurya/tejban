const { GoogleGenerativeAI } = require("@google/generative-ai");

function buildFallbackLandingCode(input) {
  const idea = input?.startupIdea || "Your AI Startup";
  const users = input?.targetUsers || "target users";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${idea}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 2rem; background: #f7f8fa; color: #1d2433; }
      .wrap { max-width: 900px; margin: 0 auto; background: #fff; padding: 2rem; border-radius: 12px; }
      h1 { margin-top: 0; }
      .btn { background: #0a7f5a; color: #fff; border: 0; padding: 0.8rem 1.2rem; border-radius: 8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>${idea}</h1>
      <p>Built for ${users}. Launch your startup with AI-powered planning.</p>
      <button class="btn">Get Started</button>
    </div>
  </body>
</html>`;

  const react = `export default function MVPAppCode() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", padding: "2rem", background: "#f7f8fa", minHeight: "100vh" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", background: "#fff", padding: "2rem", borderRadius: 12 }}>
        <h1>${idea}</h1>
        <p>Built for ${users}. Launch your startup with AI-powered planning.</p>
        <button style={{ background: "#0a7f5a", color: "#fff", border: 0, padding: "0.8rem 1.2rem", borderRadius: 8 }}>
          Get Started
        </button>
      </section>
    </main>
  );
}`;

  return { html, react };
}

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

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

async function generateLandingCode(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      mode: "mock",
      ...buildFallbackLandingCode(input)
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const envModel = process.env.GEMINI_MODEL;
  const models = envModel ? [envModel, ...MODEL_CHAIN.filter(m => m !== envModel)] : MODEL_CHAIN;

  const prompt = `Generate a landing page AND an MVP App Dashboard for this startup:
startupIdea: ${input.startupIdea}
targetUsers: ${input.targetUsers}
country: ${input.country}
budget: ${input.budget}
industry: ${input.industry}

Return strict JSON with keys: html, react.
- html: full standalone HTML landing page with embedded CSS
- react: A visually beautiful React functional component string representing the fully-functional authenticated SaaS / App Dashboard MVP view. Use dark mode, include a sidebar, stats, and a main widget area. Do NOT just return a landing page for the react code. Make it an app shell.
No markdown, no code fences.`;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: "You generate clean production-ready code and return only strict JSON.",
        generationConfig: { temperature: 0.4 }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const parsed = extractJson(cleaned);
      if (!parsed || !parsed.html || !parsed.react) {
        return {
          mode: "fallback",
          ...buildFallbackLandingCode(input)
        };
      }
      return {
        mode: "live-ai",
        model: modelName,
        html: parsed.html,
        react: parsed.react
      };
    } catch (err) {
      if (isQuotaError(err)) {
        continue; // try next model
      }
      throw err;
    }
  }

  // All models exhausted
  return {
    mode: "fallback-quota",
    ...buildFallbackLandingCode(input)
  };
}

module.exports = { generateLandingCode };
