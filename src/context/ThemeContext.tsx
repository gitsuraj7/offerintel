import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, ActiveTab } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isTransitioning: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark-executive');
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    return (localStorage.getItem('activeTab') as ActiveTab) || 'analyze';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const setTheme = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setThemeState(newTheme);
    }, 400);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    setIsMobileMenuOpen(false); // Close menu on tab change
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      isTransitioning, 
      activeTab, 
      setActiveTab,
      isMobileMenuOpen,
      setIsMobileMenuOpen
    }}>
      {children}
      {isTransitioning && (
        <div 
          className="theme-wash fixed inset-0 z-[9999] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, transparent 100%)',
            animation: 'sweep 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards'
          }}
        />
      )}
      <style>{`
        @keyframes sweep {
          0% { transform: translate(-100%, -100%) rotate(-45deg); }
          100% { transform: translate(100%, 100%) rotate(-45deg); }
        }
      `}</style>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
