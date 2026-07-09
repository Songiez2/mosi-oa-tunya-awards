import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteSettings } from '@/lib/api';
import type { SiteSettings } from '@/types/types';

interface SettingsContextType {
  settings: Partial<SiteSettings>;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({ settings: {}, loading: true, refetch: async () => {} });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const s = await getSiteSettings();
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refetch: fetch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
