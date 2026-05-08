"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "./index";
import { SUPPORTED_LOCALES } from "./index";

export async function switchLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
