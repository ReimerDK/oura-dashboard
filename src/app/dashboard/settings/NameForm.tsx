"use client";

import { useState } from "react";
import type { Translations } from "@/lib/i18n/locales/da";

interface NameFormProps {
  currentName: string;
  t: Translations["settings"];
}

export function NameForm({ currentName, t }: NameFormProps) {
  const [name, setName] = useState(currentName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/user/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320 }}>
      <label style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--ink-2)", textTransform: "uppercase" }}>
        {t.nameLabel}
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
        placeholder={t.namePlaceholder}
        maxLength={64}
        required
        style={{
          fontFamily: "var(--serif)",
          fontSize: 16,
          padding: "10px 14px",
          background: "var(--paper)",
          border: "0.5px solid var(--line)",
          borderRadius: 8,
          color: "var(--ink)",
          outline: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="submit"
          disabled={status === "saving"}
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            letterSpacing: "0.06em",
            padding: "8px 20px",
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
            borderRadius: 6,
            cursor: status === "saving" ? "default" : "pointer",
            opacity: status === "saving" ? 0.6 : 1,
          }}
        >
          {t.save}
        </button>
        {status === "saved" && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--good)" }}>{t.saved}</span>
        )}
        {status === "error" && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--warn)" }}>{t.error}</span>
        )}
      </div>
    </form>
  );
}
