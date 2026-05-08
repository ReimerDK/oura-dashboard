import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Oura Dashboard",
  description: "Health data dashboard for Oura Ring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${geistMono.variable}`}
      style={{
        "--serif": "var(--font-cormorant), 'Hoefler Text', Georgia, serif",
        "--sans": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        "--mono": "var(--font-geist-mono), ui-monospace, Menlo, monospace",
      } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
