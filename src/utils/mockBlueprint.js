function buildMockBlueprint(input) {
  const { startupIdea, targetUsers, country, budget, industry } = input;
  const seed = `${startupIdea} ${targetUsers} ${country}`;

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      mode: "mock",
      summary: `Starter blueprint for ${startupIdea}`
    },
    validation: {
      problemStatement: `${targetUsers} struggle with time-efficient outcomes in ${industry}. ${startupIdea} solves this with a focused AI workflow.`,
      marketDemand: `Growing digital adoption in ${country} suggests demand for simple and affordable AI products.`,
      targetUsers: [`Primary: ${targetUsers}`, "Secondary: educators, mentors, and institutions"],
      risks: ["Weak differentiation", "Customer trust in AI output", "Acquisition cost creep"],
      opportunities: ["Niche positioning", "Partner channels", "Usage-based expansion"]
    },
    marketAnalysis: {
      tamSamSom: {
        tam: "Large global digital services market",
        sam: `Users in ${country} actively seeking AI productivity tools`,
        som: "Initial segment reachable via focused content + paid ads"
      },
      trends: [
        "Rapid normalization of AI assistants",
        "Preference for tools that save study and planning time",
        "Increasing willingness to pay for outcome-focused SaaS"
      ],
      competitors: [
        { name: "General AI Assistant", strength: "Brand trust", weakness: "Not specialized" },
        { name: "Niche Study App", strength: "Focused workflow", weakness: "Limited intelligence" },
        { name: "Template Platform", strength: "Fast setup", weakness: "Low personalization" }
      ]
    },
    businessPlan: {
      executiveSummary: `${startupIdea} is an AI-first product targeting ${targetUsers} in ${country}, built to deliver measurable value quickly.`,
      productDescription: "Users input goals and context; AI returns structured outputs and actionable next steps.",
      marketingStrategy: ["Content funnel", "Influencer/creator collaborations", "Referral loops"],
      revenueModel: ["Free tier with monthly cap", "Pro monthly subscription", "Institutional annual plans"],
      scalingStrategy: ["Start with one niche", "Expand through adjacent user personas", "Build API/partner channels"]
    },
    branding: {
      names: [
        `${startupIdea.split(" ")[0] || "Nova"}Pilot`,
        `${startupIdea.split(" ")[0] || "Nova"}Forge`,
        "LaunchSage"
      ],
      domains: ["launchsage.ai", "novapilot.app", "buildwithsage.com"],
      slogans: [
        "From idea to startup blueprint in minutes.",
        "Think less. Launch smarter.",
        "Your AI co-founder for day zero."
      ],
      logoIdeas: ["Minimal rocket + spark", "Wordmark with upward graph", "Compass icon with AI nodes"],
      colorPalette: ["#F3EFE6", "#14213D", "#FCA311", "#2A9D8F", "#E76F51"]
    },
    landingPage: {
      headline: `${startupIdea}: launch-ready startup plans in 10 minutes`,
      subheadline: `Built for ${targetUsers}. Validate, brand, and pitch from one workspace.`,
      features: [
        "Idea validation and market insight",
        "One-click business plan generation",
        "Investor-ready pitch structure"
      ],
      pricing: [
        { tier: "Free", price: "0", description: "3 generations/month" },
        { tier: "Pro", price: "999 INR/mo", description: "Unlimited reports" },
        { tier: "Startup", price: "2999 INR/mo", description: "Team + deck exports" }
      ],
      cta: "Generate My Blueprint"
    },
    marketingPlan: {
      channels: ["SEO blog", "YouTube tutorials", "Founder communities", "LinkedIn thought leadership"],
      first90Days: [
        "Week 1-2: launch waitlist + lead magnet",
        "Week 3-6: 12 content assets + 2 webinars",
        "Week 7-12: paid experiments + partner outreach"
      ],
      metrics: ["Activation rate", "Time-to-value", "Free-to-paid conversion", "Retention"]
    },
    revenueModel: {
      primary: "SaaS subscriptions",
      secondary: ["Premium template packs", "Consulting onboarding", "Enterprise licenses"],
      projectedBreakEven: "6-9 months with disciplined paid acquisition"
    },
    pitchDeck: {
      slides: [
        "Problem",
        "Solution",
        "Market Opportunity",
        "Product Demo",
        "Business Model",
        "Go-To-Market",
        "Competition",
        "Traction Roadmap",
        "Team",
        "Financials",
        "Funding Ask"
      ],
      fundingAsk: `Requesting seed capital to accelerate product, growth, and partnerships for ${seed}.`
    },
    dnaScore: {
      marketDemand: 8,
      competition: 6,
      scalability: 9,
      profitability: 7,
      finalScore: 78
    },
    realityCheck: "⚠️ This idea is slightly saturated in generic markets. Consider pivoting to a highly specific local niche. Revenue potential is moderate initially until you build strong B2B partnerships.",
    first100UsersPlan: [
      "Find 3 niche subreddits (e.g. r/SaaS) and post a 'How I built this' story without direct selling.",
      "Cold-DM 20 potential users on LinkedIn every day for 5 days with a personalized problem-focused message.",
      "Launch a free micro-tool variant on Product Hunt to capture emails.",
      "Join 5 Discord/Slack communities for your target audience and natively answer questions.",
      "Partner with a micro-influencer (5k-10k followers) for a shoutout in exchange for lifetime pro access."
    ],
    monetizationHelper: {
      subscriptionModel: "Freemium is recommended here. Offer a robust free tier and gate the heavy AI generation features to prevent high server costs.",
      pricingTiers: [
        { name: "Hobbyist", price: "Free", features: ["Basic features", "1 project restrict"], recommended: false },
        { name: "Pro Builder", price: "$15/mo", features: ["Unlimited usage", "Priority AI processing", "Export features"], recommended: true },
        { name: "Agency", price: "$49/mo", features: ["Team collaboration", "White-label reports", "API access"], recommended: false }
      ],
      paymentGatewayGuidance: "Use Stripe Connect for international handling or Razorpay if strictly inside India. Set up webhooks for customer.subscription.updated to auto-provision AI credits via your Supabase backend."
    }
  };
}

module.exports = { buildMockBlueprint };
