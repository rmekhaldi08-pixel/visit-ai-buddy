import { useEffect, useState } from "react";

export type Interest = "food" | "souvenirs" | "spots" | "activities";
export type Budget = "low" | "medium" | "high";

export interface Prefs {
  destinationSlug: string | null;
  interests: Interest[];
  budget: Budget;
  name: string;
}

const KEY = "visitai.prefs.v1";
const defaults: Prefs = { destinationSlug: null, interests: ["food", "spots"], budget: "medium", name: "Traveler" };

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch { return defaults; }
}
export function savePrefs(p: Prefs) { localStorage.setItem(KEY, JSON.stringify(p)); }

export function usePrefs(): [Prefs, (p: Partial<Prefs>) => void] {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  useEffect(() => { savePrefs(prefs); }, [prefs]);
  const update = (p: Partial<Prefs>) => setPrefs((cur) => ({ ...cur, ...p }));
  return [prefs, update];
}