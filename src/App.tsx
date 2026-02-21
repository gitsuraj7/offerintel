import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  DollarSign, 
  ChevronRight,
  Loader2,
  Info,
  ArrowRight,
  Menu,
  AlertCircle,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  Minus
} from 'lucide-react';
import { analyzeOffer } from './services/geminiService';
import { JobOfferInput, AnalysisResult, ActiveTab, Industry } from './types';
import { cn } from './lib/utils';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { OfferProvider, useOffers } from './context/OfferContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LoadingOverlay } from './components/LoadingOverlay';
import { CustomSelect } from './components/CustomSelect';
import { COUNTRIES, INDUSTRY_POSITIONS, MAJOR_CITIES } from './constants';

const INITIAL_INPUT: JobOfferInput = {
  jobTitle: '',
  companyName: '',
  country: '',
  city: '',
  grossAnnualSalary: 0,
  currency: 'USD',
  bonusStructure: '',
  signingBonus: 0,
  equityDetails: '',
  employmentType: 'Full-time',
  workHoursPerWeek: 40,
  visaRequired: false,
  healthInsurance: 'Full',
  relocationPackage: '',
  yearsOfExperience: 0,
  industry: 'Technology',
  careerGoal: 'Growth',
};

const INDUSTRIES = Object.keys(INDUSTRY_POSITIONS) as Industry[];

function AppContent() {
  const [input, setInput] = useState<JobOfferInput>(INITIAL_INPUT);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme, activeTab, setIsMobileMenuOpen, setActiveTab } = useTheme();
  const { savedOffers, deleteOffer } = useOffers();
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  // Auto-detect currency and handle country change
  useEffect(() => {
    const countryData = COUNTRIES.find(c => c.name === input.country);
    if (countryData && countryData.currency !== input.currency) {
      setInput(prev => ({ ...prev, currency: countryData.currency }));
    }
  }, [input.country]);

  const loadingSteps = [
    'Calculating Net Income',
    'Estimating Living Costs',
    'Market Benchmarking',
    'Risk Modeling'
  ];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  const financialErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (input.grossAnnualSalary < 0) errors.grossAnnualSalary = 'Cannot be negative';
    if (input.signingBonus < 0) errors.signingBonus = 'Cannot be negative';
    if (input.yearsOfExperience < 0) errors.yearsOfExperience = 'Cannot be negative';
    if (input.currentSalary && input.currentSalary < 0) errors.currentSalary = 'Cannot be negative';
    return errors;
  }, [input]);

  const isFormInvalid = Object.keys(financialErrors).length > 0 || !input.jobTitle || !input.city || !input.country || !input.grossAnnualSalary;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid) return;
    
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeOffer(input);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze offer. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialInput = (field: keyof JobOfferInput, value: string) => {
    if (value.includes('-')) return;
    const numValue = Math.floor(Number(value));
    setInput(prev => ({ ...prev, [field]: numValue }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'analyze':
        return !result ? (
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 lg:space-y-12"
            >
              <header className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black tracking-tighter leading-tight">
                  Global <br />
                  <span className="text-[var(--accent)]">Decision Engine</span>
                </h1>
                <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl leading-relaxed">
                  Institutional-grade intelligence for global career moves. Analyze tax, cost, and risk across 190+ countries.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="luxury-card p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-10">
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <CustomSelect 
                      label="Industry"
                      options={INDUSTRIES.map(ind => ({ value: ind, label: ind }))}
                      value={input.industry}
                      onChange={val => setInput({...input, industry: val as Industry, jobTitle: ''})}
                    />
                  </div>
                  <div className="space-y-2">
                    <CustomSelect 
                      label="Position"
                      options={(INDUSTRY_POSITIONS[input.industry] || []).map(pos => ({ value: pos, label: pos }))}
                      value={input.jobTitle}
                      onChange={val => setInput({...input, jobTitle: val})}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <CustomSelect 
                      label="Country"
                      options={COUNTRIES.map(c => ({ value: c.name, label: c.name }))}
                      value={input.country}
                      onChange={val => setInput({...input, country: val, city: ''})}
                    />
                  </div>
                  <div className="space-y-2">
                    {MAJOR_CITIES[input.country] ? (
                      <CustomSelect 
                        label="City"
                        options={MAJOR_CITIES[input.country].map(city => ({ value: city, label: city }))}
                        value={input.city}
                        onChange={val => setInput({...input, city: val})}
                      />
                    ) : (
                      <>
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">City</label>
                        <input 
                          required
                          className="w-full bg-white/5 border-b border-[var(--border)] py-3 sm:py-4 outline-none focus:border-[var(--accent)] transition-colors text-lg sm:text-xl font-medium"
                          placeholder="Enter City"
                          value={input.city}
                          onChange={e => setInput({...input, city: e.target.value})}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Base Compensation</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <input 
                          required
                          type="number"
                          min="0"
                          step="1"
                          className={cn(
                            "w-full bg-white/5 border-b py-3 sm:py-4 outline-none transition-colors text-lg sm:text-xl font-medium",
                            financialErrors.grossAnnualSalary ? "border-rose-500" : "border-[var(--border)] focus:border-[var(--accent)]"
                          )}
                          placeholder="Gross Annual"
                          value={input.grossAnnualSalary || ''}
                          onChange={e => handleFinancialInput('grossAnnualSalary', e.target.value)}
                        />
                        {financialErrors.grossAnnualSalary && (
                          <span className="absolute -bottom-5 left-0 text-[10px] text-rose-500 font-bold uppercase">{financialErrors.grossAnnualSalary}</span>
                        )}
                      </div>
                      <input 
                        className="w-16 sm:w-20 bg-white/5 border-b border-[var(--border)] py-3 sm:py-4 outline-none focus:border-[var(--accent)] transition-colors text-lg sm:text-xl font-medium text-center"
                        value={input.currency}
                        onChange={e => setInput({...input, currency: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Experience</label>
                    <div className="relative">
                      <input 
                        required
                        type="number"
                        min="0"
                        step="1"
                        className={cn(
                          "w-full bg-white/5 border-b py-3 sm:py-4 outline-none transition-colors text-lg sm:text-xl font-medium",
                          financialErrors.yearsOfExperience ? "border-rose-500" : "border-[var(--border)] focus:border-[var(--accent)]"
                        )}
                        placeholder="Years"
                        value={input.yearsOfExperience || ''}
                        onChange={e => handleFinancialInput('yearsOfExperience', e.target.value)}
                      />
                      {financialErrors.yearsOfExperience && (
                        <span className="absolute -bottom-5 left-0 text-[10px] text-rose-500 font-bold uppercase">{financialErrors.yearsOfExperience}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Current Benchmark (Optional)</label>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number"
                        step="1"
                        className="w-full bg-white/5 border-b border-[var(--border)] py-3 sm:py-4 outline-none focus:border-[var(--accent)] transition-colors text-lg sm:text-xl font-medium"
                        placeholder="Current Salary"
                        value={input.currentSalary || ''}
                        onChange={e => handleFinancialInput('currentSalary', e.target.value)}
                      />
                      <input 
                        className="w-full bg-white/5 border-b border-[var(--border)] py-3 sm:py-4 outline-none focus:border-[var(--accent)] transition-colors text-lg sm:text-xl font-medium"
                        placeholder="Current Country"
                        value={input.currentCountry || ''}
                        onChange={e => setInput({...input, currentCountry: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CustomSelect 
                      label="Primary Objective"
                      options={[
                        { value: 'Growth', label: 'Growth' },
                        { value: 'Money', label: 'Capital' },
                        { value: 'Stability', label: 'Security' },
                        { value: 'Relocation', label: 'Mobility' },
                        { value: 'Brand Value', label: 'Prestige' }
                      ]}
                      value={input.careerGoal}
                      onChange={val => setInput({...input, careerGoal: val as any})}
                    />
                  </div>
                </div>

                <button 
                  disabled={loading || isFormInvalid}
                  className="luxury-button w-full py-4 sm:py-6 text-base sm:text-lg flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Initialize Analysis
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        ) : (
          <Dashboard result={result} input={input} onBack={() => setResult(null)} />
        );
      case 'reports':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-display font-black tracking-tighter">Saved Reports</h2>
              <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">{savedOffers.length} Reports Archived</p>
            </div>
            
            {savedOffers.length === 0 ? (
              <div className="luxury-card p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)]">No saved reports found in your executive archive.</p>
                <button 
                  onClick={() => setActiveTab('analyze')}
                  className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs hover:underline"
                >
                  Start New Analysis
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedOffers.map((offer) => (
                  <motion.div 
                    key={offer.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="luxury-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group"
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        offer.result.verdict.decision === 'ACCEPT' ? "bg-emerald-500/10 text-emerald-400" :
                        offer.result.verdict.decision === 'REJECT' ? "bg-rose-500/10 text-rose-400" :
                        "bg-amber-500/10 text-amber-400"
                      )}>
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{offer.input.jobTitle}</h4>
                        <p className="text-[var(--text-muted)] text-sm">{offer.input.city}, {offer.input.country} • {new Date(offer.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Net Salary</p>
                        <p className="font-black text-[var(--accent)]">
                          {offer.input.currency} {offer.result.financialBreakdown.yearlyNetIncome.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setInput(offer.input);
                            setResult(offer.result);
                            setActiveTab('analyze');
                          }}
                          className="p-3 bg-white/5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/10 transition-all"
                          title="View Report"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => deleteOffer(offer.id)}
                          className="p-3 bg-white/5 rounded-xl text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete Report"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );
      case 'compare':
        const selectedOffers = savedOffers.filter(o => selectedForComparison.includes(o.id));
        
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-display font-black tracking-tighter">Compare Offers</h2>
              <div className="flex items-center gap-4">
                <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                  {selectedForComparison.length} / 3 Selected
                </p>
                {selectedForComparison.length > 0 && (
                  <button 
                    onClick={() => setSelectedForComparison([])}
                    className="text-rose-400 text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            {savedOffers.length === 0 ? (
              <div className="luxury-card p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <ArrowRightLeft className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)]">No offers available for comparison. Save some analyses first.</p>
              </div>
            ) : selectedForComparison.length === 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedOffers.map(offer => (
                  <button
                    key={offer.id}
                    onClick={() => setSelectedForComparison(prev => [...prev, offer.id].slice(0, 3))}
                    className="luxury-card p-6 text-left hover:border-[var(--accent)] transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Net Salary</p>
                        <p className="font-black text-sm">{offer.input.currency} {offer.result.financialBreakdown.yearlyNetIncome.toLocaleString()}</p>
                      </div>
                    </div>
                    <h4 className="font-bold mb-1">{offer.input.jobTitle}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{offer.input.city}, {offer.input.country}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Selection Bar */}
                <div className="flex flex-wrap gap-4">
                  {savedOffers.map(offer => {
                    const isSelected = selectedForComparison.includes(offer.id);
                    return (
                      <button
                        key={offer.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedForComparison(prev => prev.filter(id => id !== offer.id));
                          } else if (selectedForComparison.length < 3) {
                            setSelectedForComparison(prev => [...prev, offer.id]);
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                          isSelected 
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
                            : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:bg-white/10"
                        )}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {offer.input.jobTitle}
                      </button>
                    );
                  })}
                </div>

                {/* Comparison Table */}
                <div className="luxury-card overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="p-6 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] w-1/4">Metric</th>
                        {selectedOffers.map(offer => (
                          <th key={offer.id} className="p-6 border-b border-[var(--border)] text-center">
                            <p className="font-black text-lg leading-tight">{offer.input.jobTitle}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{offer.input.city}</p>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Annual Net Salary', key: 'yearlyNetIncome', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Effective Tax Rate', key: 'effectiveTaxRate', format: (v: any) => `${v}%` },
                        { label: 'Monthly Savings', key: 'monthlySavings', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Fairness Score', key: 'salaryFairness', format: (v: any) => `${v}%` },
                        { label: 'Career Impact', key: 'careerImpact', format: (v: any) => `${v}%` },
                        { label: 'Work-Life Balance', key: 'workLifeBalance', format: (v: any) => `${v}/10` },
                        { label: 'Rent (Monthly)', key: 'rent', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Food (Monthly)', key: 'food', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Transport (Monthly)', key: 'transport', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Healthcare (Monthly)', key: 'healthcare', format: (v: any, o: any) => `${o.input.currency} ${v.toLocaleString()}` },
                        { label: 'Risk Level', key: 'level', format: (v: any) => v },
                        { label: 'Confidence', key: 'decisionConfidence', format: (v: any) => v },
                        { label: 'Verdict', key: 'decision', format: (v: any) => v },
                      ].map((row, i) => (
                        <tr key={row.label} className={cn(i % 2 === 0 ? "bg-white/[0.02]" : "")}>
                          <td className="p-6 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]/5">{row.label}</td>
                          {selectedOffers.map(offer => {
                            let val;
                            if (row.key === 'yearlyNetIncome' || row.key === 'effectiveTaxRate') val = offer.result.financialBreakdown[row.key as keyof typeof offer.result.financialBreakdown];
                            else if (row.key === 'monthlySavings') val = offer.result.savingsProjection.monthlySavings;
                            else if (row.key === 'salaryFairness' || row.key === 'workLifeBalance' || row.key === 'careerImpact' || row.key === 'decisionConfidence') val = offer.result.scores[row.key as keyof typeof offer.result.scores];
                            else if (row.key === 'rent' || row.key === 'food' || row.key === 'transport' || row.key === 'healthcare') val = offer.result.costOfLiving[row.key as keyof typeof offer.result.costOfLiving];
                            else if (row.key === 'level') val = offer.result.riskAnalysis.level;
                            else if (row.key === 'decision') val = offer.result.verdict.decision;

                            return (
                              <td key={offer.id} className="p-6 text-center border-b border-[var(--border)]/5">
                                <span className={cn(
                                  "font-bold",
                                  row.key === 'decision' && (
                                    val === 'ACCEPT' ? "text-emerald-400" :
                                    val === 'REJECT' ? "text-rose-400" :
                                    "text-amber-400"
                                  ),
                                  row.key === 'yearlyNetIncome' && "text-[var(--accent)] text-lg"
                                )}>
                                  {row.format(val, offer)}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl font-display font-black tracking-tighter">Preferences</h2>
            <div className="luxury-card p-8 space-y-6">
              <div className="space-y-2">
                <CustomSelect 
                  label="Default Currency"
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'GBP', label: 'GBP' }
                  ]}
                  value="USD"
                  onChange={() => {}}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Data Privacy</label>
                <div className="flex items-center justify-between py-4 border-b border-[var(--border)]">
                  <span className="font-medium">Anonymous Mode</span>
                  <div className="w-12 h-6 bg-[var(--accent)] rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex w-full relative">
      <Sidebar />
      
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-500 w-full overflow-x-hidden",
        "sm:ml-20 lg:ml-64"
      )}>
        {/* Mobile Header */}
        <header className="sm:hidden h-16 px-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--bg)]/80 backdrop-blur-md z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <Crown className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-black tracking-tighter uppercase text-sm">OfferIntel</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <AnimatePresence mode="wait">
          {loading && <LoadingOverlay steps={loadingSteps} currentStep={loadingStep} />}
        </AnimatePresence>

        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (result ? '-result' : '')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Background Particles for Violet Elite */}
      {theme === 'violet-elite' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                width: Math.random() * 3 + 2 + 'px',
                height: Math.random() * 3 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: '110%',
                animationDuration: Math.random() * 10 + 10 + 's',
                animationDelay: Math.random() * 10 + 's'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/5 to-transparent" />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <OfferProvider>
        <AppContent />
      </OfferProvider>
    </ThemeProvider>
  );
}

// Missing icons for tab views
const FileText = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>;
const ArrowRightLeft = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>;
const Crown = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
