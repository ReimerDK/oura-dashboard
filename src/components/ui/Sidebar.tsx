"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/i18n/locales/da";

interface SidebarProps {
  t: Translations["nav"];
  locale: Locale;
}

export function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" />
        Oura
      </div>
    </header>
  );
}

export function Sidebar({ t, locale }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: t.overview, icon: "⊕" },
    { href: "/dashboard/sleep", label: t.sleep, icon: "◑" },
    { href: "/dashboard/activity", label: t.activity, icon: "◈" },
    { href: "/dashboard/readiness", label: t.readiness, icon: "◎" },
    { href: "/dashboard/heart-rate", label: t.heartRate, icon: "♡" },
    { href: "/dashboard/compare", label: t.compare, icon: "⇄" },
    { href: "/dashboard/settings", label: t.settings, icon: "◦" },
  ];

  return (
    <aside className="dash-side">
      <h5>{t.navigation}</h5>
      <nav>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
              <span className="icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "0.5px solid var(--line)" }}>
        <div style={{ marginBottom: 12 }}>
          <LocaleSwitcher current={locale} />
        </div>
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
          {t.logout}
        </button>
      </div>
    </aside>
  );
}
