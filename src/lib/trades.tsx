import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { UiTrade } from '../types';
import { fetchInitialCapital, fetchTrades, insertTrade } from './db';
import type { NewTrade } from './db';
import { buildDerived } from './derive';
import type { Derived } from './derive';

interface TradesValue {
  trades: UiTrade[];
  derived: Derived;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTrade: (input: NewTrade) => Promise<void>;
}

const TradesContext = createContext<TradesValue | null>(null);

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<UiTrade[]>([]);
  const [initialCapital, setInitialCapital] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [t, cap] = await Promise.all([fetchTrades(), fetchInitialCapital()]);
      setTrades(t);
      setInitialCapital(cap);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했어요');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addTrade = useCallback(
    async (input: NewTrade) => {
      await insertTrade(input);
      await refresh();
    },
    [refresh],
  );

  const derived = useMemo(() => buildDerived(trades, initialCapital), [trades, initialCapital]);

  return (
    <TradesContext.Provider value={{ trades, derived, loading, error, refresh, addTrade }}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradesContext);
  if (!ctx) throw new Error('useTrades must be used within TradesProvider');
  return ctx;
}
