const { GoogleGenerativeAI } = require("@google/generative-ai");

function buildFallbackLandingCode(input) {
  const idea = input?.startupIdea || "Your AI Startup";
  const users = input?.targetUsers || "target users";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${idea} - Premium Workspace</title>
    <style>
      body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; background: #09090b; color: #f8fafc; line-height: 1.6; }
      nav { display: flex; gap: 20px; padding: 20px 40px; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); position: sticky; top: 0; z-index: 100; }
      nav a { color: #fff; text-decoration: none; font-weight: 500; font-size: 0.95rem; }
      nav a:hover { color: #00d4ff; }
      .section { min-height: 80vh; padding: 100px 40px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .wrap { max-width: 1000px; margin: 0 auto; }
      h1 { margin-top: 0; font-size: 3rem; background: linear-gradient(90deg, #00d4ff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      h2 { font-size: 2rem; color: #e2e8f0; }
      .card { background: rgba(255,255,255,0.03); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
      .btn { background: linear-gradient(90deg, #00d4ff, #8a2be2); color: #fff; border: 0; padding: 1rem 2rem; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; font-size: 0.9rem; }
      footer { text-align: center; padding: 30px; background: #000; color: rgba(255,255,255,0.5); font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.1); }
    </style>
  </head>
  <body>
    <nav>
      <div style="font-weight: 800; font-size: 1.2rem; margin-right: auto; background: linear-gradient(90deg, #00d4ff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">TEJBAN BUILDER</div>
      <a href="#home">Home</a>
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
    </nav>
    
    <div id="home" class="section">
      <div class="wrap">
        <h1>${idea}</h1>
        <p style="font-size: 1.2rem; opacity: 0.9; max-width: 600px;">Built for ${users}. Launch your startup with AI-powered planning.</p>
        <button class="btn" style="margin-top: 20px;">Get Started</button>
      </div>
    </div>

    <div id="features" class="section" style="background: radial-gradient(circle at bottom right, rgba(138,43,226,0.1), transparent 50%);">
      <div class="wrap">
        <h2>Features</h2>
        <div class="card" style="margin-top: 40px;">
          <h3 style="color: #00d4ff;">AI-Assisted Blueprint</h3>
          <p>We generate everything from financial projections to target demographics specifically for your industry.</p>
        </div>
      </div>
    </div>

    <div id="pricing" class="section">
      <div class="wrap">
        <h2>Pricing</h2>
        <div class="card" style="text-align: center; max-width: 400px; margin: 40px auto 0;">
          <h3>Pro Workspace</h3>
          <h1 style="font-size: 2.5rem; margin: 20px 0;">$29<span style="font-size: 1rem; color: #888;">/mo</span></h1>
          <p style="margin-bottom: 30px;">Full access to premium analytics and MVP dashboard.</p>
          <button class="btn" style="width: 100%;">Subscribe Now</button>
        </div>
      </div>
    </div>

    <footer>
      &copy; 2026 TejBan - Powered by Tejas Developers. All rights reserved.
    </footer>
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
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash"
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

  const prompt = `Generate a premium, completely unique, professional website AND an MVP App Dashboard for this startup:
startupIdea: ${input.startupIdea}
targetUsers: ${input.targetUsers}
country: ${input.country}
budget: ${input.budget}
industry: ${input.industry}

Return strict JSON with keys: html, react. Output clean and concise code to minimize token usage.
- html: Generate a full standalone HTML website in a single file using embedded CSS. 
  - Simulate at least 3 distinct pages/sections using fluid scrolling. 
  - Design MUST look premium with glassmorphic cards and dark mode aesthetics.
  - MUST contain a footer: "© TejBan - Powered by Tejas Developers".

- react: A visually beautiful React functional component string for a SaaS / App Dashboard MVP view. Use dark mode, include a sidebar, and a main widget area. Include a small footer: "Powered by Tejas Developers".
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
