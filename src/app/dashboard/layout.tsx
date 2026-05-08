import { Sidebar, Topbar } from "@/components/ui/Sidebar";
import { getLocale, getTranslations } from "@/lib/i18n";
import { TranslationsProvider } from "@/lib/i18n/TranslationsContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [locale, t] = await Promise.all([getLocale(), getTranslations()]);
  return (
    <TranslationsProvider t={t}>
      <Topbar />
      <div className="dash">
        <Sidebar t={t.nav} locale={locale} />
        <main className="dash-main">{children}</main>
      </div>
    </TranslationsProvider>
  );
}
