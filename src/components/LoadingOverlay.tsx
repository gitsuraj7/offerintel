import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  steps: string[];
  currentStep: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ steps, currentStep }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full space-y-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-[var(--accent)] animate-spin" />
            <div className="absolute inset-0 blur-xl bg-[var(--accent)]/20 animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight">Processing Intelligence</h2>
          <p className="text-[var(--text-muted)] text-sm">Synthesizing market data and risk models...</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="relative h-10 w-1 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/5 rounded-full" />
                {i <= currentStep && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    className="absolute top-0 w-full bg-[var(--accent)] rounded-full shadow-[0_0_10px_var(--glow)]"
                  />
                )}
              </div>
              <span className={cn(
                "text-sm font-bold uppercase tracking-widest transition-colors duration-500",
                i === currentStep ? "text-[var(--text)]" : i < currentStep ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
