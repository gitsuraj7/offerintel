import React from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon,
  ArrowUpRight,
  FileText,
  AlertCircle,
  ChevronLeft,
  Save,
  Check
} from 'lucide-react';
import { AnalysisResult, JobOfferInput } from '../types';
import { cn } from '../lib/utils';
import { CountUp } from './CountUp';
import { useOffers } from '../context/OfferContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line, 
  CartesianGrid,
  Cell
} from 'recharts';
import Markdown from 'react-markdown';

interface DashboardProps {
  result: AnalysisResult;
  input: JobOfferInput;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ result, input, onBack }) => {
  const [viewCurrency, setViewCurrency] = React.useState<'local' | 'usd'>('local');
  const { saveOffer, savedOffers } = useOffers();
  const [isSaved, setIsSaved] = React.useState(false);

  // Check if already saved
  React.useEffect(() => {
    const exists = savedOffers.some(o => 
      o.input.jobTitle === input.jobTitle && 
      o.input.grossAnnualSalary === input.grossAnnualSalary &&
      o.input.city === input.city
    );
    setIsSaved(exists);
  }, [savedOffers, input]);

  const handleSave = () => {
    if (!isSaved) {
      saveOffer(input, result);
      setIsSaved(true);
    }
  };

  const getVerdictGlow = (decision: string) => {
    switch (decision) {
      case 'ACCEPT': return 'shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-500/50 text-emerald-400';
      case 'NEGOTIATE': return 'shadow-[0_0_20px_rgba(245,158,11,0.3)] border-amber-500/50 text-amber-400';
      case 'REJECT': return 'shadow-[0_0_20px_rgba(239,68,68,0.3)] border-rose-500/50 text-rose-400';
      case 'ACCEPT WITH CAUTION': return 'shadow-[0_0_20px_rgba(139,92,246,0.3)] border-violet-500/50 text-violet-400';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-emerald-400';
    if (score >= 41) return 'text-amber-400';
    return 'text-rose-400';
  };

  const displaySalary = viewCurrency === 'local' 
    ? result.financialBreakdown.yearlyNetIncome 
    : result.financialBreakdown.usdEquivalent.yearlyNet;

  const displayCurrency = viewCurrency === 'local' ? input.currency : 'USD';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6 sm:space-y-8 pb-20 print:p-0"
    >
      {/* Back Button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Analysis
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-widest border",
              isSaved 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default" 
                : "bg-white/5 border-white/10 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/10"
            )}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaved ? 'Saved to Archive' : 'Save Analysis'}
          </button>
          <div className="bg-white/5 rounded-lg p-1 flex border border-[var(--border)]">
            <button 
              onClick={() => setViewCurrency('local')}
              className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", viewCurrency === 'local' ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)]")}
            >
              {input.currency}
            </button>
            <button 
              onClick={() => setViewCurrency('usd')}
              className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", viewCurrency === 'usd' ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)]")}
            >
              USD
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Global Intelligence Active
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {result.warnings.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.1)] space-y-3"
        >
          <div className="flex items-center gap-3 text-amber-400 font-bold uppercase tracking-widest text-xs">
            <AlertCircle className="w-5 h-5" />
            Significant Cost Adjustment Detected
          </div>
          <ul className="space-y-1">
            {result.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-200/70 flex items-center gap-2">
                <span className="w-1 h-1 bg-amber-400 rounded-full" />
                {warning}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Hero Panel */}
      <section className="relative overflow-hidden luxury-card p-6 sm:p-8 lg:p-12">
        <div className="absolute top-0 right-0 p-4 sm:p-8 print:hidden">
          <button onClick={() => window.print()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-muted)]" />
          </button>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-display font-black tracking-tighter mb-6 sm:mb-8 leading-tight">
            Offer Intelligence Report
          </h2>
          
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Title</span>
                  <span className="text-xs sm:text-sm font-bold">{input.jobTitle}</span>
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Industry</span>
                  <span className="text-xs sm:text-sm font-bold">{input.industry}</span>
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 rounded-full border border-white/10 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Tier</span>
                  <span className="text-xs sm:text-sm font-bold">{result.costOfLiving.cityTier}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Estimated Annual Net ({displayCurrency})</p>
                <div className="text-5xl sm:text-6xl lg:text-8xl font-display font-black tracking-tighter text-[var(--accent)]">
                  <CountUp end={displaySalary} prefix={displayCurrency === 'USD' ? '$' : ''} />
                </div>
                {viewCurrency === 'local' && (
                  <p className="text-xs font-bold text-[var(--text-muted)] mt-2">
                    Approx. USD Equivalent: ${result.financialBreakdown.usdEquivalent.yearlyNet.toLocaleString()} (Rate: {result.financialBreakdown.usdEquivalent.exchangeRate})
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 w-full space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Fairness</p>
                  <p className={cn("text-2xl font-black", getScoreColor(result.scores.salaryFairness))}>
                    {result.scores.salaryFairness}%
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Confidence</p>
                  <p className="text-2xl font-black text-[var(--accent)]">
                    {result.scores.decisionConfidence}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white/5 rounded-2xl border border-white/10 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Monthly Savings</p>
                  <p className="text-2xl sm:text-3xl font-black">
                    <CountUp end={result.savingsProjection.monthlySavings} prefix={input.currency === 'USD' ? '$' : ''} />
                  </p>
                </div>
                <div className={cn(
                  "px-4 py-2 sm:px-6 sm:py-3 rounded-xl border font-black tracking-widest text-[10px] sm:text-sm whitespace-nowrap",
                  getVerdictGlow(result.verdict.decision)
                )}>
                  {result.verdict.decision}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Financial Breakdown */}
        <div className="luxury-card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Financial Structure</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-rose-400">Tax: {result.financialBreakdown.effectiveTaxRate}%</span>
              <DollarSign className="w-4 h-4 text-[var(--accent)]" />
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Gross', value: input.grossAnnualSalary },
                { name: 'Net', value: result.financialBreakdown.yearlyNetIncome },
                { name: 'Tax', value: input.grossAnnualSalary - result.financialBreakdown.yearlyNetIncome }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                  { [0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? 'var(--accent)' : 'var(--text-muted)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-[10px] text-[var(--text-muted)] italic leading-relaxed">
            {result.financialBreakdown.taxAssumptions}
          </p>
        </div>

        {/* Global Metrics & WLB */}
        <div className="luxury-card p-6 sm:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Work-Life Index</h3>
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Hours</p>
                <p className="text-xl font-black">{result.globalMetrics.avgWeeklyHours}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Leave</p>
                <p className="text-xl font-black">{result.globalMetrics.minPaidLeave}d</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Holidays</p>
                <p className="text-xl font-black">{result.globalMetrics.publicHolidays}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">WLB Score</span>
                <span className="text-lg font-black text-[var(--accent)]">{result.scores.workLifeBalance}/10</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${result.scores.workLifeBalance * 10}%` }}
                  className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400"
                />
              </div>
            </div>

            {result.scores.lifestyleImpact !== undefined && (
              <div className="p-4 bg-[var(--accent)]/5 rounded-2xl border border-[var(--accent)]/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Lifestyle Impact</span>
                  <span className="text-lg font-black text-emerald-400">+{result.scores.lifestyleImpact}%</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      <span>Current ({input.currentCountry || 'Origin'})</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <div className="h-full w-1/2 bg-[var(--text-muted)] opacity-50 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-[var(--accent)]">
                      <span>New ({input.country})</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full">
                      <motion.div 
                        initial={{ width: '50%' }}
                        animate={{ width: `${50 + (result.scores.lifestyleImpact / 2)}%` }}
                        className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-[var(--text-muted)]">Estimated improvement in purchasing power and quality of life benchmarked against your current location.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cost of Living */}
        <div className="luxury-card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Cost of Living Index</h3>
            <PieIcon className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="space-y-5 sm:space-y-6">
            {[
              { label: 'Rent', value: result.costOfLiving.rent, total: result.financialBreakdown.monthlyNetIncome },
              { label: 'Food', value: result.costOfLiving.food, total: result.financialBreakdown.monthlyNetIncome },
              { label: 'Transport', value: result.costOfLiving.transport, total: result.financialBreakdown.monthlyNetIncome },
              { label: 'Healthcare', value: result.costOfLiving.healthcare, total: result.financialBreakdown.monthlyNetIncome },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                  <span className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">{item.label}</span>
                  <span>{Math.round((item.value / item.total) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.total) * 100}%` }}
                    className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--glow)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Projection */}
        <div className="luxury-card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Wealth Accumulation (5Y)</h3>
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { year: 'Y1', value: result.savingsProjection.annualSavingsPotential },
                { year: 'Y2', value: result.savingsProjection.annualSavingsPotential * 2.1 },
                { year: 'Y3', value: result.savingsProjection.annualSavingsPotential * 3.3 },
                { year: 'Y4', value: result.savingsProjection.annualSavingsPotential * 4.6 },
                { year: 'Y5', value: result.savingsProjection.annualSavingsPotential * 6.0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent)" 
                  strokeWidth={3} 
                  dot={{ fill: 'var(--accent)', strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Profile */}
        <div className="luxury-card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Risk Profile</h3>
            <Shield className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="space-y-5 sm:space-y-6">
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl border flex items-center gap-4",
              result.riskAnalysis.level === 'Low' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              result.riskAnalysis.level === 'Medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-rose-500/10 border-rose-500/20 text-rose-400"
            )}>
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Exposure Level</p>
                <p className="text-xl sm:text-2xl font-black">{result.riskAnalysis.level}</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
              {result.riskAnalysis.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <section className="luxury-card p-6 sm:p-8 lg:p-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight">Negotiation Strategy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Fair Market Range</p>
                <p className="text-lg sm:text-xl font-bold">{result.negotiation.marketRange}</p>
              </div>
              <div className="p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Suggested Target</p>
                <p className="text-lg sm:text-xl font-bold text-[var(--accent)]">{result.negotiation.suggestedNegotiationRange}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Key Talking Points</p>
              <ul className="space-y-3">
                {result.negotiation.negotiationItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="luxury-button w-full py-4 flex items-center justify-center gap-3 text-sm sm:text-base print:hidden">
              <FileText className="w-5 h-5" />
              Generate Negotiation Letter
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Report */}
      <section className="luxury-card p-6 sm:p-8 lg:p-12 overflow-hidden print:border-none print:shadow-none">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-8 pb-4 border-b border-[var(--border)]">Detailed Analysis Report</h3>
        <div className="prose prose-invert max-w-none prose-sm sm:prose-base print:text-black print:prose-black">
          <Markdown>{result.rawMarkdown}</Markdown>
        </div>
      </section>
    </motion.div>
  );
};
