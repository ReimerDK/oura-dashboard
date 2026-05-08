import { cookies } from "next/headers";
import { da } from "./locales/da";
import { en } from "./locales/en";
import type { Translations } from "./locales/da";

export { interpolate } from "./interpolate";
export type { Translations } from "./locales/da";

export type Locale = "da" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["da", "en"];
export const DEFAULT_LOCALE: Locale = "da";
const COOKIE_NAME = "locale";

const locales: Record<Locale, Translations> = { da, en };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export async function getTranslations(): Promise<Translations> {
  const locale = await getLocale();
  return locales[locale];
}

export async function setLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
