"use client";

import { useTransition } from "react";
import { switchLocale } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n";

interface LocaleSwitcherProps {
  current: Locale;
}

const labels: Record<Locale, string> = { da: "DA", en: "EN" };
const all: Locale[] = ["da", "en"];

export function LocaleSwitcher({ current }: LocaleSwitcherProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div style={{ display: "flex", gap: 4, opacity: pending ? 0.5 : 1 }}>
      {all.map((locale) => (
        <button
          key={locale}
          onClick={() => startTransition(() => switchLocale(locale))}
          disabled={locale === current || pending}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            padding: "3px 7px",
            borderRadius: 5,
            border: "0.5px solid var(--line)",
            background: locale === current ? "var(--ink)" : "transparent",
            color: locale === current ? "var(--paper)" : "var(--ink-3)",
            cursor: locale === current ? "default" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  );
}
