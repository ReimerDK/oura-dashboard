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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col h-full">
      <div className="px-5 py-6">
        <span className="text-white font-semibold text-lg tracking-tight">Oura Dashboard</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Log ud
        </button>
      </div>
    </aside>
  );
}
