import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { FormData } from './types';

const STORAGE_KEY = 'pm-intake:v1';

interface Persisted {
  data: FormData;
  step: number;
  maxStep: number;
  updatedAt: number | null;
  submission: { id: string; at: number } | null;
}

const EMPTY: Persisted = { data: {}, step: 0, maxStep: 0, updatedAt: null, submission: null };

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return EMPTY;
}

interface Store extends Persisted {
  set: (key: string, value: unknown) => void;
  setStep: (step: number) => void;
  setSubmission: (s: Persisted['submission']) => void;
  reset: () => void;
  saving: boolean;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number>();

  useEffect(() => {
    setSaving(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* quota exceeded: keep working in memory */
      }
      setSaving(false);
    }, 350);
    return () => window.clearTimeout(timer.current);
  }, [state]);

  const set = useCallback((key: string, value: unknown) => {
    setState((s) => ({ ...s, data: { ...s.data, [key]: value }, updatedAt: Date.now() }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((s) => ({ ...s, step, maxStep: Math.max(s.maxStep, step) }));
  }, []);

  const setSubmission = useCallback((submission: Persisted['submission']) => {
    setState((s) => ({ ...s, submission }));
  }, []);

  const reset = useCallback(() => setState({ ...EMPTY }), []);

  const value = useMemo(() => ({ ...state, set, setStep, setSubmission, reset, saving }), [state, set, setStep, setSubmission, reset, saving]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
