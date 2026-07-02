require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const express = require("express");
const cors = require("cors");
const { z } = require("zod");
const { generateStartupBlueprint } = require("./services/aiEngine");
const { buildBusinessPlanPdf, buildPitchDeckPdf } = require("./services/pdfExporter");
const { generateLandingCode } = require("./services/landingCodeEngine");
const PremiumPDFGenerator = require("./services/premiumPDFGenerator");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  getPublicSupabaseConfig,
  requireEligibleUser,
  saveProjectHistory,
  listProjectHistory,
  getPublicFeed,
  deleteAccount
} = require("./services/supabaseService");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  if (req.path.startsWith("/admin") || req.path.startsWith("/api/admin")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
});

const ideaSchema = z.object({
  startupIdea: z.string().min(5),
  targetUsers: z.string().min(2),
  country: z.string().min(2),
  budget: z.string().min(1),
  industry: z.string().min(2)
});

const blueprintSchema = z.object({
  blueprint: z.record(z.any())
});

const projectSaveSchema = z.object({
  ideaInput: ideaSchema,
  blueprint: z.record(z.any()),
  landingCode: z
    .object({
      html: z.string().optional(),
      react: z.string().optional()
    })
    .optional()
});

const accountDeleteSchema = z.object({
  confirmText: z.string().min(1),
  confirmEmail: z.string().email()
});

const adminLoginSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

const ADMIN_COOKIE_NAME = "tejban_admin_session";
const ADMIN_TOKEN_TTL_SECONDS = 8 * 60 * 60;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT || "";
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || "";

function parseCookies(cookieHeader) {
  const out = {};
  String(cookieHeader || "")
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const i = entry.indexOf("=");
      if (i <= 0) return;
      out[entry.slice(0, i)] = decodeURIComponent(entry.slice(i + 1));
    });
  return out;
}

function getAdminTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "").trim();
  }
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies[ADMIN_COOKIE_NAME] || "";
}

function signAdminToken(payloadObj) {
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const signature = crypto.createHmac("sha256", ADMIN_AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || !ADMIN_AUTH_SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", ADMIN_AUTH_SECRET).update(payload).digest("base64url");

  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed?.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hashAdminPassword(password) {
  return crypto.createHash("sha256").update(`${ADMIN_PASSWORD_SALT}:${password}`).digest("hex");
}

function requireAdminAuth(req, res, next) {
  const payload = verifyAdminToken(getAdminTokenFromRequest(req));
  if (!payload) {
    return res.status(401).json({ error: "Unauthorized admin access" });
  }
  req.admin = payload;
  return next();
}

function requireAdminPageAuth(req, res, next) {
  const payload = verifyAdminToken(getAdminTokenFromRequest(req));
  if (!payload) {
    return res.redirect("/admin-login.html");
  }
  req.admin = payload;
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "tejban" });
});

app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

app.get("/api/config", (_req, res) => {
  res.json({
    ...getPublicSupabaseConfig(),
    auth: {
      passwordMinLength: Number(process.env.AUTH_PASSWORD_MIN_LENGTH || 8),
      requireEmailConfirmation: String(process.env.AUTH_REQUIRE_EMAIL_CONFIRMATION || "true") === "true",
      redirectUrl: process.env.SUPABASE_REDIRECT_URL || "http://localhost:3000",
      termsVersion: process.env.AUTH_TERMS_VERSION || "2026-03-11",
      requiredProfileFields: ["full_name", "date_of_birth", "headline", "bio"],
      twoStepOptions: ["email", "authenticator_app"]
    },
    hasNetlifyDeployHook: Boolean(process.env.NETLIFY_DEPLOY_HOOK_URL),
    hasVercelDeployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL)
  });
});

app.post("/api/generate", async (req, res) => {
  const parsed = ideaSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten()
    });
  }

  try {
    await requireEligibleUser(req.headers.authorization, {
      requireProfile: true,
      requireTermsAcceptance: true,
      requireTwoStepPreference: true
    });
    const blueprint = await generateStartupBlueprint(parsed.data);
    return res.json({ blueprint });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = /confirm|verify|profile|terms|2-step/i.test(message) ? 401 : 500;
    return res.status(status).json({
      error: "Generation failed",
      message
    });
  }
});

app.post("/api/generate-landing-code", async (req, res) => {
  const parsed = ideaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  try {
    await requireEligibleUser(req.headers.authorization, true);
    const result = await generateLandingCode(parsed.data);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate landing code", message: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key is missing" });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let systemInstruction = "Your name is Tejas. You are an expert AI Co-Founder and business advisor for the user's startup. You MUST answer concisely and professionally.";
    if (context && context.startupIdea) {
      systemInstruction += `\n\nContext about the user's current startup idea:\nIdea: ${context.startupIdea}\nTarget Users: ${context.targetUsers}\nIndustry: ${context.industry}\nBudget: ${context.budget}`;
    } else {
      systemInstruction += "\n\nThe user hasn't generated a startup blueprint yet. Help them brainstorm from scratch.";
    }

    const prompt = `${systemInstruction}\n\nUser: ${message}\nTejas:`;
    
    const result = await model.generateContent(prompt);
    return res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten()
    });
  }

  try {
    await requireEligibleUser(req.headers.authorization, {
      requireProfile: true,
      requireTermsAcceptance: true,
      requireTwoStepPreference: true
    });
    const landingCode = await generateLandingCode(parsed.data);
    return res.json({ landingCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = /confirm|verify|profile|terms|2-step/i.test(message) ? 401 : 500;
    return res.status(status).json({
      error: "Landing code generation failed",
      message
    });
  }
});

app.post("/api/export/json", (req, res) => {
  const body = req.body || {};
  const payload = JSON.stringify(body, null, 2);

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=startup-blueprint.json");
  res.send(payload);
});

app.post("/api/export/business-plan-pdf", async (req, res) => {
  const parsed = blueprintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid blueprint payload" });
  }

  try {
    const buffer = await buildBusinessPlanPdf(parsed.data.blueprint);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=business-plan.pdf");
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: "PDF export failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/export/pitch-deck-pdf", async (req, res) => {
  const parsed = blueprintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid blueprint payload" });
  }

  try {
    const buffer = await buildPitchDeckPdf(parsed.data.blueprint);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=pitch-deck.pdf");
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: "PDF export failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/export/premium-report-pdf", async (req, res) => {
  const parsed = blueprintSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid blueprint payload" });
  }

  try {
    const blueprint = parsed.data.blueprint;
    
    // Initialize PDF generator
    const pdfGenerator = new PremiumPDFGenerator();
    await pdfGenerator.initialize();

    // Helper to safely get nested properties
    const getNested = (obj, path, defaultVal) => {
      try {
        return path.split('.').reduce((acc, part) => acc[part], obj) || defaultVal;
      } catch (e) {
        return defaultVal;
      }
    };

    // Safely extract from either old schema or new schema
    const b = blueprint;

    // Prepare template data from blueprint
    const templateData = {
      startupName: getNested(b, 'branding.names.0') || b.name || "Startup Idea",
      tagline: getNested(b, 'branding.slogans.0') || b.tagline || "Powered by AI",
      generatedDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      summary: getNested(b, 'businessPlan.executiveSummary') || b.executiveSummary || b.description || "An innovative solution solving a defined problem.",
      highlight1: getNested(b, 'validation.problemStatement') || getNested(b, 'highlights.0') || "Identified core pain points.",
      highlight2: getNested(b, 'validation.marketDemand') || getNested(b, 'highlights.1') || "Clear demand in target demographic.",
      highlight3: getNested(b, 'validation.opportunities.0') || getNested(b, 'highlights.2') || "Distinctly separated positioning.",

      // DNA Score & Reality Check
      dnaMarketDemand: getNested(b, 'dnaScore.marketDemand') || 7,
      dnaMarketDemandPct: (getNested(b, 'dnaScore.marketDemand') || 7) * 10,
      dnaCompetition: getNested(b, 'dnaScore.competition') || 6,
      dnaCompetitionPct: (getNested(b, 'dnaScore.competition') || 6) * 10,
      dnaScalability: getNested(b, 'dnaScore.scalability') || 8,
      dnaScalabilityPct: (getNested(b, 'dnaScore.scalability') || 8) * 10,
      dnaProfitability: getNested(b, 'dnaScore.profitability') || 7,
      dnaProfitabilityPct: (getNested(b, 'dnaScore.profitability') || 7) * 10,
      dnaFinalScore: getNested(b, 'dnaScore.finalScore') || 75,
      realityCheckText: b.realityCheck || "This idea has potential, but requires strong operational execution to stand out.",

      // Market Analysis
      marketScore: b.marketScore || "85",
      marketAnalysis: getNested(b, 'marketAnalysis.trends.0') || b.marketAnalysis || "Growing market opportunity with strong demand.",
      marketPoint1: getNested(b, 'marketAnalysis.tamSamSom.tam') || getNested(b, 'marketPoints.0') || "Large addressable market",
      marketPoint2: getNested(b, 'marketAnalysis.tamSamSom.sam') || getNested(b, 'marketPoints.1') || "Growing user adoption",
      marketPoint3: getNested(b, 'marketAnalysis.tamSamSom.som') || getNested(b, 'marketPoints.2') || "Positive market trends",
      
      // Competitive Analysis
      competitiveScore: b.competitiveScore || "78",
      competitiveAnalysis: getNested(b, 'marketAnalysis.competitors.0.name') ? `Competing against ${getNested(b, 'marketAnalysis.competitors.0.name')} and others.` : b.competitiveAnalysis || "Strong competitive positioning.",
      strengths: getNested(b, 'marketAnalysis.competitors.0.weakness') ? `Capitalizes on: ${getNested(b, 'marketAnalysis.competitors.0.weakness')}` : b.strengths || "Clear differentiation and strong team",
      opportunities: getNested(b, 'validation.opportunities.0') || b.opportunities || "Market expansion and strategic partnerships",
      
      // Business Model
      revenueStream1: getNested(b, 'businessPlan.revenueModel.0') || getNested(b, 'revenueStreams.0') || "Subscription model",
      revenueStream2: getNested(b, 'businessPlan.revenueModel.1') || getNested(b, 'revenueStreams.1') || "Enterprise licensing",
      revenueStream3: getNested(b, 'businessPlan.revenueModel.2') || getNested(b, 'revenueStreams.2') || "Professional services",
      pricingStrategy: getNested(b, 'landingPage.pricingTiers.0') || b.pricingStrategy || "Tiered pricing scaling with usage limits.",
      cac: b.cac || "$200-$500",
      ltv: b.ltv || "$1,500-$3,000",
      paybackPeriod: b.paybackPeriod || "3-6 months",
      
      // Go-to-Market
      targetMarket: getNested(b, 'validation.targetUsers.0') || b.targetMarket || "Mid-market to Enterprise early adopters",
      gtmStrategy1: getNested(b, 'businessPlan.marketingStrategy.0') || getNested(b, 'gtmStrategy.0') || "Content marketing and SEO",
      gtmStrategy2: getNested(b, 'businessPlan.marketingStrategy.1') || getNested(b, 'gtmStrategy.1') || "Strategic partnerships",
      gtmStrategy3: getNested(b, 'marketingPlan.channels.0') || getNested(b, 'gtmStrategy.2') || "Direct sales to key accounts",
      milestone1: getNested(b, 'marketingPlan.actionPlan.0') || getNested(b, 'milestones.0') || "Build MVP and conduct beta testing",
      milestone2: getNested(b, 'marketingPlan.actionPlan.1') || getNested(b, 'milestones.1') || "Achieve product-market fit metrics",
      milestone3: getNested(b, 'marketingPlan.actionPlan.2') || getNested(b, 'milestones.2') || "Begin scaling growth loops",
      
      // First 100 Users
      firstUser1: getNested(b, 'first100UsersPlan.0') || b.firstUsers?.[0] || "Post in niche Subreddits and Facebook Groups",
      firstUser2: getNested(b, 'first100UsersPlan.1') || b.firstUsers?.[1] || "Cold DM 20 local business owners on LinkedIn/IG daily",
      firstUser3: getNested(b, 'first100UsersPlan.2') || b.firstUsers?.[2] || "Launch a free micro-tool variant on Product Hunt",

      // Funding & Team
      teamComposition: getNested(b, 'pitchDeck.slides.8.content') || b.teamComposition || "Experienced founding team capable of execution",
      fundingRound: b.fundingRound || "Seed",
      fundingAmount: b.fundingAmount || "$500K - $1M",
      fundUse1: b.fundUse?.[0] || "Product & Engineering (40%)",
      fundUse2: b.fundUse?.[1] || "Growth & Marketing (40%)",
      fundUse3: b.fundUse?.[2] || "Operations & Runway (20%)",
      
      // Financial Projections
      financialProjections: getNested(b, 'revenueModel.financialProjections') || b.financialProjections || "Conservative bottom-up revenue forecast.",
      year1Revenue: b.year1Revenue || "$200K ARR",
      year2Revenue: b.year2Revenue || "$1.5M ARR",
      year3Revenue: b.year3Revenue || "$5M+ ARR",
      breakeven: b.breakeven || "Month 18",
      financialAssumptions: b.financialAssumptions || "Based on initial traction and low-end target conversion rates.",
      
      // Risk & Mitigation
      risk1: getNested(b, 'validation.risks.0') || b.risks?.[0] || "Fast-moving competitive landscape",
      risk2: getNested(b, 'validation.risks.1') || b.risks?.[1] || "CAC increases on paid channels",
      risk3: getNested(b, 'validation.risks.2') || b.risks?.[2] || "Slower enterprise adoption",
      mitigation1: getNested(b, 'validation.opportunities.1') || b.mitigations?.[0] || "Heavy focus on proprietary data loops",
      mitigation2: getNested(b, 'validation.opportunities.2') || b.mitigations?.[1] || "Establishing organic content ecosystems",
      mitigation3: getNested(b, 'validation.opportunities.0') || b.mitigations?.[2] || "Validating immediately with SMBs first",

      // Operational Requirements
      coe: getNested(b, 'businessPlan.centerOfExcellence') || "Establish a dedicated Center of Excellence to drive constant innovation, standardize operational frameworks, and foster continued learning and development.",
      infrastructure: getNested(b, 'businessPlan.infrastructure') || "Cloud-native microservices architecture, highly scalable database clusters, and automated CI/CD deployment pipelines.",
      materials: getNested(b, 'businessPlan.materials') || "SaaS licensing, high-end workstations, API subscriptions, and digital marketing collateral.",
      emp1: getNested(b, 'businessPlan.employeeRoles.0') || "Founding Engineering Team (Full-stack, DevOps, QA)",
      emp2: getNested(b, 'businessPlan.employeeRoles.1') || "Product & Design (UX/UI, Product Manager)",
      emp3: getNested(b, 'businessPlan.employeeRoles.2') || "Growth & Marketing (Performance marketing, Content)",
      emp4: getNested(b, 'businessPlan.employeeRoles.3') || "Sales & Customer Success (Account Executives, Support)",

      // Investment Breakdown
      inv1: getNested(b, 'revenueModel.investmentBreakdown.0.category') || "Technology & Engineering",
      inv2: getNested(b, 'revenueModel.investmentBreakdown.1.category') || "Marketing & Growth",
      inv3: getNested(b, 'revenueModel.investmentBreakdown.2.category') || "Operations & Legal",
      inv4: getNested(b, 'revenueModel.investmentBreakdown.3.category') || "Buffer/Runway",
      invP1: parseInt(getNested(b, 'revenueModel.investmentBreakdown.0.percentage')) || 40,
      invP2: parseInt(getNested(b, 'revenueModel.investmentBreakdown.1.percentage')) || 30,
      invP3: parseInt(getNested(b, 'revenueModel.investmentBreakdown.2.percentage')) || 20,
      invP4: parseInt(getNested(b, 'revenueModel.investmentBreakdown.3.percentage')) || 10,

      // Trends & Analytics
      pastTrend: parseInt(getNested(b, 'marketAnalysis.trends.pastPct')) || (Math.floor(Math.random() * 20) + 20),
      currentTrend: parseInt(getNested(b, 'marketAnalysis.trends.currentPct')) || (Math.floor(Math.random() * 20) + 50),
      futureTrend: parseInt(getNested(b, 'marketAnalysis.trends.futurePct')) || (Math.floor(Math.random() * 15) + 85),
      analyticalInsight: getNested(b, 'marketAnalysis.trends.insight') || "Historical data indicates a strong acceleration in compounding vertical growth. Projecting out 5 years, we expect total addressable consumption to skyrocket due to lowering barriers of entry and increased demand for automation."
    };

    // Calculate cumulative pie chart data
    templateData.pie1 = templateData.invP1;
    templateData.pie12 = templateData.invP1 + templateData.invP2;
    templateData.pie123 = templateData.invP1 + templateData.invP2 + templateData.invP3;

    // Generate PDF
    const templatePath = path.join(__dirname, "..", "public", "startup-report.html");
    const outputPath = path.join(__dirname, "..", "temp", `report-${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, "..", "temp");
    if (!require("fs").existsSync(tempDir)) {
      require("fs").mkdirSync(tempDir, { recursive: true });
    }

    const result = await pdfGenerator.createPremiumReport(templatePath, templateData, outputPath);

    if (!result.success) {
      await pdfGenerator.cleanup();
      return res.status(500).json({
        error: "PDF generation failed",
        message: result.error
      });
    }

    // Read generated PDF and send
    const pdfBuffer = require("fs").readFileSync(outputPath);
    
    // Cleanup temp file
    require("fs").unlinkSync(outputPath);
    await pdfGenerator.cleanup();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=startup-report.pdf");
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Premium PDF export error:", error);
    require("fs").writeFileSync(path.join(__dirname, "..", "last_pdf_error.txt"), error.stack || error.message || String(error));
    return res.status(500).json({
      error: "PDF export failed",
      message: error.message || "Unknown error occurred during PDF generation"
    });
  }
});

app.post("/api/history/save", async (req, res) => {
  const parsed = projectSaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid project payload",
      details: parsed.error.flatten()
    });
  }

  try {
    const saved = await saveProjectHistory({
      authHeader: req.headers.authorization,
      payload: parsed.data
    });
    return res.json({ saved });
  } catch (error) {
    return res.status(401).json({
      error: "Save failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/history/list", async (req, res) => {
  try {
    const items = await listProjectHistory(req.headers.authorization);
    return res.json({ items });
  } catch (error) {
    return res.status(401).json({
      error: "History fetch failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/feed", async (req, res) => {
  try {
    const items = await getPublicFeed();
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({
      error: "Feed fetch failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/account/delete", async (req, res) => {
  const parsed = accountDeleteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid delete account payload",
      details: parsed.error.flatten()
    });
  }

  try {
    const result = await deleteAccount({
      authHeader: req.headers.authorization,
      confirmText: parsed.data.confirmText,
      confirmEmail: parsed.data.confirmEmail
    });

    return res.json(result);
  } catch (error) {
    return res.status(401).json({
      error: "Account deletion failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

async function triggerDeployHook(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Deploy hook failed: ${response.status} ${text}`);
  }
}

app.post("/api/admin/login", (req, res) => {
  const parsed = adminLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid admin credentials payload" });
  }

  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT || !ADMIN_AUTH_SECRET) {
    return res.status(503).json({ error: "Admin auth not configured on server" });
  }

  const { username, email, password } = parsed.data;
  const userMatch = username.trim().toLowerCase() === ADMIN_USERNAME.trim().toLowerCase();
  const emailMatch = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
  const hashMatch = hashAdminPassword(password);

  let validHash = false;
  if (hashMatch.length === ADMIN_PASSWORD_HASH.length) {
    validHash = crypto.timingSafeEqual(Buffer.from(hashMatch), Buffer.from(ADMIN_PASSWORD_HASH));
  }

  if (!userMatch || !emailMatch || !validHash) {
    return res.status(401).json({ error: "Invalid admin username, email, or password" });
  }

  const token = signAdminToken({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    exp: Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000
  });

  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${ADMIN_TOKEN_TTL_SECONDS}`
  );

  return res.json({ ok: true });
});

app.post("/api/admin/logout", (_req, res) => {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
  );
  return res.json({ ok: true });
});

app.get("/admin", requireAdminPageAuth, (_req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

app.get("/admin.html", (_req, res) => {
  return res.redirect("/admin");
});

app.post("/api/deploy/netlify", requireAdminAuth, async (_req, res) => {
  const hook = process.env.NETLIFY_DEPLOY_HOOK_URL;
  if (!hook) return res.status(400).json({ error: "NETLIFY_DEPLOY_HOOK_URL not set" });

  try {
    await triggerDeployHook(hook, { source: "tejban", timestamp: Date.now() });
    return res.json({ ok: true, platform: "netlify" });
  } catch (error) {
    return res.status(500).json({
      error: "Netlify deploy failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/deploy/vercel", requireAdminAuth, async (_req, res) => {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return res.status(400).json({ error: "VERCEL_DEPLOY_HOOK_URL not set" });

  try {
    await triggerDeployHook(hook, { source: "tejban", timestamp: Date.now() });
    return res.json({ ok: true, platform: "vercel" });
  } catch (error) {
    return res.status(500).json({
      error: "Vercel deploy failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.get("/api/admin/stats", requireAdminAuth, async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const basePayload = {
    totalProjects: 0,
    projectsThisWeek: 0,
    projectsThisMonth: 0,
    recentProjects: [],
    dailyActivity: (() => {
      const out = {};
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        out[d.toISOString().slice(0, 10)] = 0;
      }
      return out;
    })(),
    hasNetlifyDeployHook: Boolean(process.env.NETLIFY_DEPLOY_HOOK_URL),
    hasVercelDeployHook: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  };

  if (!supabaseUrl || !serviceKey) {
    return res.json({
      ...basePayload,
      statsWarning: "Supabase is not configured. Showing local-only dashboard values."
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [totalRes, weekRes, monthRes, recentRes] = await Promise.all([
      supabase.from("startup_projects").select("id", { count: "exact", head: true }),
      supabase.from("startup_projects").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
      supabase.from("startup_projects").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
      supabase
        .from("startup_projects")
        .select("id, created_at, idea_input, user_id")
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

    const dailyRes = await supabase
      .from("startup_projects")
      .select("created_at")
      .gte("created_at", new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: true });

    const dailyMap = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }

    (dailyRes.data || []).forEach((row) => {
      const key = row.created_at.slice(0, 10);
      if (Object.prototype.hasOwnProperty.call(dailyMap, key)) {
        dailyMap[key]++;
      }
    });

    return res.json({
      ...basePayload,
      totalProjects: totalRes.count ?? 0,
      projectsThisWeek: weekRes.count ?? 0,
      projectsThisMonth: monthRes.count ?? 0,
      recentProjects: recentRes.data || [],
      dailyActivity: dailyMap,
      statsWarning: [totalRes.error, weekRes.error, monthRes.error, recentRes.error, dailyRes.error]
        .filter(Boolean)
        .map((e) => e.message)
        .join(" | ") || ""
    });
  } catch (error) {
    return res.json({
      ...basePayload,
      statsWarning: `Stats fetch fallback: ${error instanceof Error ? error.message : "Unknown error"}`
    });
  }
});

app.use(express.static("public"));

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, () => {
  console.log(`TejBan running at http://localhost:${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is busy, starting on port ${port + 1}...`);
    app.listen(port + 1, () => {
      console.log(`TejBan running at http://localhost:${port + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
