"use client";

import { createContext, useContext } from "react";
import type { Translations } from "./locales/da";
import { da } from "./locales/da";

const TranslationsContext = createContext<Translations>(da);

export function TranslationsProvider({ t, children }: { t: Translations; children: React.ReactNode }) {
  return <TranslationsContext.Provider value={t}>{children}</TranslationsContext.Provider>;
}

export function useT(): Translations {
  return useContext(TranslationsContext);
}
