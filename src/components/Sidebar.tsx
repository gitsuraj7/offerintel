import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  ArrowRightLeft, 
  Settings, 
  Crown,
  Moon,
  Sun,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode, ActiveTab } from '../types';
import { cn } from '../lib/utils';

export const Sidebar: React.FC = () => {
  const { theme, setTheme, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen } = useTheme();

  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'analyze', label: 'Analyze Offer', icon: LayoutDashboard },
    { id: 'reports', label: 'Saved Reports', icon: FileText },
    { id: 'compare', label: 'Compare Offers', icon: ArrowRightLeft },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center lg:justify-start gap-3 sidebar-content-compact">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--glow)]">
            <Crown className="text-white w-6 h-6" />
          </div>
          <span className="hidden lg:block font-display font-black text-xl tracking-tighter uppercase hide-on-short">
            OfferIntel
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              activeTab === item.id 
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--glow)] font-bold" 
                : "hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", activeTab === item.id && "scale-110")} />
            <span className="hidden lg:block font-medium text-sm hide-on-short">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTabGlow"
                className="absolute inset-0 rounded-xl bg-white/10 blur-sm -z-10"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="px-4 lg:px-6 pb-8 pt-6 border-t border-[var(--border)]/20 mt-auto">
        <div className="bg-black/20 rounded-2xl p-1.5 flex flex-col lg:flex-row gap-1.5 shadow-inner relative overflow-hidden group/theme theme-switch-container">
          <ThemeToggle 
            active={theme === 'dark-executive'} 
            onClick={() => setTheme('dark-executive')}
            icon={Moon}
            label="Executive"
          />
          <ThemeToggle 
            active={theme === 'light-wealth'} 
            onClick={() => setTheme('light-wealth')}
            icon={Sun}
            label="Wealth"
          />
          <ThemeToggle 
            active={theme === 'violet-elite'} 
            onClick={() => setTheme('violet-elite')}
            icon={Zap}
            label="Elite"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-[var(--card)] border-r border-[var(--border)] hidden sm:flex flex-col z-50 transition-all duration-500 sidebar-container",
        "w-20 lg:w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] sm:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-[var(--card)] border-r border-[var(--border)] z-[70] sm:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const ThemeToggle: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: any;
  label: string;
}> = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300",
      active ? "bg-[var(--card)] text-[var(--accent)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text)]"
    )}
    title={label}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest hide-on-short">{label}</span>
  </button>
);
