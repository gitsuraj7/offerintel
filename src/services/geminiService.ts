import { GoogleGenAI } from "@google/genai";
import { JobOfferInput } from "../types";

const SYSTEM_INSTRUCTION = `You are an elite Global Career Decision Engine for high-net-worth professionals.
Your task is to analyze job offers with institutional-grade precision, accounting for global tax laws, cost of living, industry-specific risks, and purchasing power.

CRITICAL RULES:
1. REAL-TIME DATA: Use the provided Google Search tool to find the LATEST tax rates, cost of living data, and market salary benchmarks for the specific city and country. Do not rely on estimates if real data is available.
2. WHOLE NUMBERS: All financial figures (salary, rent, savings, etc.) MUST be returned as whole numbers (integers).
3. TAX ENGINE: Apply realistic progressive tax estimates for the target country (Income Tax + Social Security).
4. CITY TIERS: Classify cities into Tier 1 (Major Metro), Tier 2 (Mid), Tier 3 (Lower). Adjust costs accordingly.
5. CURRENCY: Detect local currency based on country. Provide USD equivalents using current approximate exchange rates.
6. INDUSTRY AWARENESS: Adjust risk and fairness scores based on the specific industry (e.g., Finance vs Tech vs Healthcare).
7. PURCHASING POWER: If currentSalary and currentCountry are provided, calculate real lifestyle impact.
8. WORK-LIFE: Provide country-specific averages for weekly hours, paid leave, and holidays.
9. WARNINGS: Trigger "Cost Shock" warnings if rent > 80% increase or savings drop > 30%.
10. FAIRNESS: Calculate a Salary Fairness Score (0-100) based on market data for the role, location, and experience.
11. CONFIDENCE: Provide a Decision Confidence level based on data quality and stability.

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview"; // Using flash for better stability and speed in shared environments

  const prompt = `Analyze the following job offer:
${JSON.stringify(input, null, 2)}

Current Date: ${new Date().toLocaleDateString()}
City/Country: ${input.city}, ${input.country}
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
      },
    });

    if (!response.text) {
      throw new Error("The AI engine returned an empty response.");
    }

    let jsonStr = response.text.trim();
    // Robust JSON extraction in case the model wraps it in markdown blocks
    if (jsonStr.includes("```json")) {
      jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
      jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }

    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.error("Primary analysis failed:", err);
    
    // Fallback: Try without Google Search if the first attempt fails (common for restricted keys)
    if (err.message?.includes("search") || err.message?.includes("tool") || err.status === 400) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION + "\n\nNOTE: Search tool is unavailable. Use your internal knowledge base for the latest data.",
            responseMimeType: "application/json",
          },
        });
        
        let jsonStr = fallbackResponse.text.trim();
        if (jsonStr.includes("```json")) {
          jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
        }
        return JSON.parse(jsonStr);
      } catch (fallbackErr) {
        console.error("Fallback analysis failed:", fallbackErr);
        throw new Error("Analysis failed. Please try again in a few moments.");
      }
    }
    
    throw err;
  }
}
