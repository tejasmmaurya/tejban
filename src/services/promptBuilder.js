function buildSystemPrompt() {
  return `You are a startup strategy AI. Return ONLY valid JSON.
The JSON must include these keys:
validation, marketAnalysis, businessPlan, branding, landingPage, marketingPlan, revenueModel, monetizationHelper, pitchDeck, dnaScore, realityCheck, first100UsersPlan.
Keep outputs practical, concise, and ready for immediate execution.`;
}

function buildUserPrompt(input) {
  const { startupIdea, targetUsers, country, budget, industry } = input;

  return `Generate a startup blueprint for:
- Startup idea: ${startupIdea}
- Target users: ${targetUsers}
- Country: ${country}
- Budget: ${budget}
- Industry: ${industry}

Requirements:
1) Idea validation: problem statement, market demand, risks, opportunities.
2) Market analysis: TAM/SAM/SOM summary, competitor list, and deep analytical trends.
3) Business plan: executive summary, product description, scaling strategy.
4) Branding: 5 brand names, 5 domain suggestions, 5 slogans, logo concepts, 5-color palette.
5) Landing page copy: headline, subheadline, features, pricing tiers, CTA.
6) Marketing plan: channels, 90-day action plan, key metrics.
7) Revenue model details, including investmentBreakdown array of exactly 4 objects {category, percentage}.
8) Pitch deck outline: 10-12 slides and funding ask.
9) dnaScore: A JSON object with marketDemand (1-10), competition (1-10), scalability (1-10), profitability (1-10), and finalScore (1-100).
10) realityCheck: Brutally honest feedback ("This idea is saturated ⚠️", "Better pivot: ___", etc.). Build trust by being real.
11) first100UsersPlan: An array of 4-6 highly specific, zero-budget, scrappy steps to get the very first 100 users.
12) monetizationHelper: A JSON object containing:
    - "pricingTiers": Array of 3 objects {name, price, features, recommended(boolean)}
    - "subscriptionModel": Short rationale for the best model (e.g., Freemium vs usage-based).
    - "paymentGatewayGuidance": Step-by-step guidance on setting up Stripe or Razorpay for this specific business.

Return strictly valid JSON with no markdown formatting.`;
}

module.exports = { buildSystemPrompt, buildUserPrompt };
