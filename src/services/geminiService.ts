import { GoogleGenAI } from "@google/genai";
import { JobOfferInput } from "../types";

const SYSTEM_INSTRUCTION = `You are an elite Global Career Decision Engine for high-net-worth professionals.
Your task is to analyze job offers with institutional-grade precision, accounting for global tax laws, cost of living, industry-specific risks, and purchasing power.

CRITICAL RULES:
1. TAX ENGINE: Apply realistic progressive tax estimates for the target country (Income Tax + Social Security).
2. CITY TIERS: Classify cities into Tier 1 (Major Metro), Tier 2 (Mid), Tier 3 (Lower). Adjust costs accordingly.
3. CURRENCY: Detect local currency based on country. Provide USD equivalents using current approximate exchange rates.
4. INDUSTRY AWARENESS: Adjust risk and fairness scores based on the specific industry (e.g., Finance vs Tech vs Healthcare).
5. PURCHASING POWER: If currentSalary and currentCountry are provided, calculate real lifestyle impact.
6. WORK-LIFE: Provide country-specific averages for weekly hours, paid leave, and holidays.
7. WARNINGS: Trigger "Cost Shock" warnings if rent > 80% increase or savings drop > 30%.
8. FAIRNESS: Calculate a Salary Fairness Score (0-100) based on market data for the role, location, and experience.
9. CONFIDENCE: Provide a Decision Confidence level based on data quality and stability.

Return your analysis in a structured JSON format that matches the following schema:
{
  "financialBreakdown": {
    "monthlyNetIncome": number,
    "yearlyNetIncome": number,
    "taxAssumptions": "string",
    "effectiveTaxRate": number (0-100),
    "usdEquivalent": {
      "monthlyNet": number,
      "yearlyNet": number,
      "exchangeRate": number
    }
  },
  "costOfLiving": {
    "rent": number,
    "utilities": number,
    "food": number,
    "transport": number,
    "healthcare": number,
    "insurance": number,
    "misc": number,
    "totalEssential": number,
    "cityTier": 1 | 2 | 3
  },
  "savingsProjection": {
    "monthlyDisposable": number,
    "monthlySavings": number,
    "annualSavingsPotential": number
  },
  "scores": {
    "purchasingPower": number (1-10),
    "careerImpact": number (1-10),
    "salaryFairness": number (0-100),
    "workLifeBalance": number (1-10),
    "lifestyleImpact": number (0-100) (optional),
    "decisionConfidence": "Low" | "Medium" | "High"
  },
  "globalMetrics": {
    "avgWeeklyHours": number,
    "minPaidLeave": number,
    "publicHolidays": number
  },
  "riskAnalysis": {
    "level": "Low" | "Medium" | "High",
    "explanation": "string"
  },
  "warnings": ["string"],
  "negotiation": {
    "isCompetitive": boolean,
    "marketRange": "string",
    "suggestedNegotiationRange": "string",
    "weakComponents": ["string"],
    "negotiationItems": ["string"]
  },
  "comparison": {
    "purchasingPowerDiff": "string",
    "savingsPotentialDiff": "string",
    "realTermsChangePercent": number,
    "housingCostIncreasePercent": number
  } (optional),
  "verdict": {
    "decision": "ACCEPT" | "NEGOTIATE" | "REJECT" | "ACCEPT WITH CAUTION",
    "reasoning": "string",
    "strategicAdvice": "string",
    "actionPlan": ["string"]
  },
  "rawMarkdown": "A full, detailed markdown report (2000+ words) following the user's requested sections"
}

Be analytical, structured, and decisive. No fluff.`;

export async function analyzeOffer(input: JobOfferInput) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3.1-pro-preview";

  const prompt = `Analyze the following job offer:
${JSON.stringify(input, null, 2)}

Current Date: ${new Date().toLocaleDateString()}
City/Country: ${input.city}, ${input.country}
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis");
  }

  return JSON.parse(response.text);
}
