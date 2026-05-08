import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "@/lib/i18n";
import { NameForm } from "./NameForm";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const [session, t] = await Promise.all([auth(), getTranslations()]);
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });

  return (
    <div className="lift-in-1" style={{ maxWidth: 560 }}>
      <h1 className="greeting">{t.settings.heading}</h1>
      <div className="embr-card" style={{ marginTop: 24 }}>
        <NameForm currentName={user?.name ?? ""} t={t.settings} />
      </div>
    </div>
  );
}
