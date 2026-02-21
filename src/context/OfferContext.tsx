import React, { createContext, useContext, useState, useEffect } from 'react';
import { JobOfferInput, AnalysisResult } from '../types';

export interface SavedOffer {
  id: string;
  input: JobOfferInput;
  result: AnalysisResult;
  timestamp: number;
}

interface OfferContextType {
  savedOffers: SavedOffer[];
  saveOffer: (input: JobOfferInput, result: AnalysisResult) => void;
  deleteOffer: (id: string) => void;
  clearOffers: () => void;
}

const OfferContext = createContext<OfferContextType | undefined>(undefined);

export const OfferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedOffers, setSavedOffers] = useState<SavedOffer[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('savedOffers');
    if (stored) {
      try {
        setSavedOffers(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved offers', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedOffers', JSON.stringify(savedOffers));
  }, [savedOffers]);

  const saveOffer = (input: JobOfferInput, result: AnalysisResult) => {
    const newOffer: SavedOffer = {
      id: crypto.randomUUID(),
      input,
      result,
      timestamp: Date.now(),
    };
    setSavedOffers(prev => [newOffer, ...prev]);
  };

  const deleteOffer = (id: string) => {
    setSavedOffers(prev => prev.filter(o => o.id !== id));
  };

  const clearOffers = () => {
    setSavedOffers([]);
  };

  return (
    <OfferContext.Provider value={{ savedOffers, saveOffer, deleteOffer, clearOffers }}>
      {children}
    </OfferContext.Provider>
  );
};

export const useOffers = () => {
  const context = useContext(OfferContext);
  if (!context) throw new Error('useOffers must be used within an OfferProvider');
  return context;
};
