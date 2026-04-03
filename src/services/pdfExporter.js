const PDFDocument = require("pdfkit");

function buildPdfBuffer(title, sections) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text(title, { underline: true });
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor("#666").text(`Generated at: ${new Date().toISOString()}`);
    doc.fillColor("#111");
    doc.moveDown();

    sections.forEach((section) => {
      doc.fontSize(14).text(section.heading || "Section", { continued: false });
      doc.moveDown(0.2);
      doc.fontSize(10).text(section.content || "No content provided.", {
        width: 520,
        align: "left"
      });
      doc.moveDown();
    });

    doc.end();
  });
}

function stringify(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function buildBusinessPlanPdf(blueprint) {
  const businessPlan = blueprint?.businessPlan || {};
  const marketingPlan = blueprint?.marketingPlan || {};
  const revenueModel = blueprint?.revenueModel || {};

  const sections = [
    { heading: "Executive Summary", content: stringify(businessPlan.executiveSummary) },
    { heading: "Product Description", content: stringify(businessPlan.productDescription) },
    { heading: "Marketing Strategy", content: stringify(businessPlan.marketingStrategy) },
    { heading: "Revenue Model", content: stringify(businessPlan.revenueModel || revenueModel) },
    { heading: "Scaling Strategy", content: stringify(businessPlan.scalingStrategy) },
    { heading: "90-Day Marketing Plan", content: stringify(marketingPlan.first90Days) },
    { heading: "Key Metrics", content: stringify(marketingPlan.metrics) }
  ];

  return buildPdfBuffer("Business Plan - TejBan", sections);
}

async function buildPitchDeckPdf(blueprint) {
  const pitchDeck = blueprint?.pitchDeck || {};
  const validation = blueprint?.validation || {};
  const market = blueprint?.marketAnalysis || {};

  const slides = Array.isArray(pitchDeck.slides) ? pitchDeck.slides : [];

  const sections = [
    { heading: "Problem", content: stringify(validation.problemStatement) },
    { heading: "Solution", content: stringify(blueprint?.landingPage?.headline || "AI-powered startup blueprint platform") },
    { heading: "Market", content: stringify(market.tamSamSom || market) },
    { heading: "Business Model", content: stringify(blueprint?.revenueModel) },
    { heading: "Competition", content: stringify(market.competitors) },
    { heading: "Traction Roadmap", content: stringify(blueprint?.marketingPlan?.first90Days) },
    { heading: "Funding Ask", content: stringify(pitchDeck.fundingAsk) },
    { heading: "Suggested Slide Order", content: stringify(slides) }
  ];

  return buildPdfBuffer("Pitch Deck - TejBan", sections);
}

module.exports = {
  buildBusinessPlanPdf,
  buildPitchDeckPdf
};
