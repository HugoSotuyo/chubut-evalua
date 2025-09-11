
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { getSystemSettings, updateSystemSettings as updateSystemSettingsDb } from '@/lib/settingsService';
import type { SystemSettings } from '@/lib/types';

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: SystemSettings = {
    approvalThreshold: 60,
    correctScore: 1,
    partialScore: 0.5,
    incorrectScore: 0,
    defaultScore: 10,
    scoreStep: 1,
};


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getSystemSettings();
        setSettings(data);
    } catch (error) {
        console.error("Failed to fetch system settings:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    await updateSystemSettingsDb(newSettings);
    // Optimistically update local state
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Or fetch from DB to ensure consistency
    await fetchSettings(); 
  };

  const value = { settings, updateSettings, loading };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
