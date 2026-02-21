export type ThemeMode = 'dark-executive' | 'light-wealth' | 'violet-elite';
export type ActiveTab = 'analyze' | 'reports' | 'compare' | 'settings';
export type Industry = 'Technology' | 'Healthcare' | 'Finance' | 'Engineering' | 'Education' | 'Government' | 'Logistics' | 'Marketing' | 'Manufacturing' | 'Other';

export interface JobOfferInput {
  jobTitle: string;
  companyName?: string;
  country: string;
  city: string;
  grossAnnualSalary: number;
  currency: string;
  bonusStructure: string;
  signingBonus: number;
  equityDetails: string;
  employmentType: string;
  workHoursPerWeek: number;
  visaRequired: boolean;
  healthInsurance: 'Full' | 'Partial' | 'None';
  relocationPackage: string;
  estimatedMonthlyRent?: number;
  currentSalary?: number;
  currentCountry?: string;
  yearsOfExperience: number;
  industry: Industry;
  careerGoal: 'Money' | 'Growth' | 'Stability' | 'Relocation' | 'Brand Value';
}

export interface AnalysisResult {
  financialBreakdown: {
    monthlyNetIncome: number;
    yearlyNetIncome: number;
    taxAssumptions: string;
    effectiveTaxRate: number;
    usdEquivalent: {
      monthlyNet: number;
      yearlyNet: number;
      exchangeRate: number;
    };
  };
  costOfLiving: {
    rent: number;
    utilities: number;
    food: number;
    transport: number;
    healthcare: number;
    insurance: number;
    misc: number;
    totalEssential: number;
    cityTier: 1 | 2 | 3;
  };
  savingsProjection: {
    monthlyDisposable: number;
    monthlySavings: number;
    annualSavingsPotential: number;
  };
  scores: {
    purchasingPower: number;
    careerImpact: number;
    salaryFairness: number; // 0-100
    workLifeBalance: number; // 1-10
    lifestyleImpact?: number; // 0-100
    decisionConfidence: 'Low' | 'Medium' | 'High';
  };
  globalMetrics: {
    avgWeeklyHours: number;
    minPaidLeave: number;
    publicHolidays: number;
  };
  riskAnalysis: {
    level: 'Low' | 'Medium' | 'High';
    explanation: string;
  };
  warnings: string[];
  negotiation: {
    isCompetitive: boolean;
    marketRange: string;
    suggestedNegotiationRange: string;
    weakComponents: string[];
    negotiationItems: string[];
  };
  comparison?: {
    purchasingPowerDiff: string;
    savingsPotentialDiff: string;
    realTermsChangePercent: number;
    housingCostIncreasePercent: number;
  };
  verdict: {
    decision: 'ACCEPT' | 'NEGOTIATE' | 'REJECT' | 'ACCEPT WITH CAUTION';
    reasoning: string;
    strategicAdvice: string;
    actionPlan: string[];
  };
  rawMarkdown: string;
}
