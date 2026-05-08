"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overblik", icon: "⊕" },
  { href: "/dashboard/sleep", label: "Søvn", icon: "◑" },
  { href: "/dashboard/activity", label: "Aktivitet", icon: "◈" },
  { href: "/dashboard/readiness", label: "Parathed", icon: "◎" },
  { href: "/dashboard/heart-rate", label: "Puls & HRV", icon: "♡" },
  { href: "/dashboard/compare", label: "Sammenlign", icon: "⇄" },
];

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dash-side">
      <h5>Navigation</h5>
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
        <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/" })}>
          Log ud
        </button>
      </div>
    </aside>
  );
}
