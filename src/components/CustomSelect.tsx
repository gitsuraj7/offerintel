import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, label, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] block mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white/5 border-b py-3 sm:py-4 px-1 outline-none transition-all text-left flex items-center justify-between group",
          isOpen ? "border-[var(--accent)] shadow-[0_4px_12px_-4px_var(--glow)]" : "border-[var(--border)] hover:border-[var(--text-muted)]"
        )}
      >
        <span className="text-lg sm:text-xl font-medium text-[var(--text)] truncate mr-2">
          {selectedOption?.label || 'Select option'}
        </span>
        <ChevronDown className={cn(
          "w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 group-hover:text-[var(--accent)] shrink-0",
          isOpen && "rotate-180 text-[var(--accent)]"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 bg-[#0F172A] border border-[var(--border)] rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2 border-b border-[var(--border)]/50">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent)] transition-colors text-white"
              />
            </div>
            <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-6 py-4 text-base font-medium transition-all flex items-center justify-between group/opt",
                      value === option.value 
                        ? "bg-[var(--accent)] text-white" 
                        : "text-[#F8FAFC] hover:bg-gradient-to-r hover:from-[var(--accent)]/20 hover:to-transparent"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <motion.div 
                        layoutId="activeOption"
                        className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] shrink-0 ml-2"
                      />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-[var(--text-muted)] text-sm italic">
                  No results found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
