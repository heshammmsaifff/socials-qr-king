import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaGlobe } from "react-icons/fa6";
import { AdminDashboardForm } from "@/components/admin-dashboard-form";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string }>;

export default async function AdminDashboard({ params }: { params: Params }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!hasEnv) {
    redirect(`/${locale}`);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  // Fetch all profiles from database
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  const otherLocale = locale === "en" ? "ar" : "en";
  const otherLocaleName = locale === "en" ? "العربية" : "English";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center p-4 px-6 text-sm">
          <div className="flex gap-4 items-center">
            <Link
              href={`/${locale}`}
              className="flex gap-2 items-center font-bold text-lg tracking-tight"
            >
              <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">
                QR
              </span>
              <span>{dict.common.title}</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">{dict.common.admin}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/${otherLocale}/admin`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-accent transition text-xs font-semibold"
            >
              <FaGlobe className="text-muted-foreground w-3.5 h-3.5" />
              <span>{otherLocaleName}</span>
            </Link>
            <ThemeSwitcher />
            <AuthButton locale={locale} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">
            {dict.common.admin}
          </h1>
          <p className="text-muted-foreground">
            {dict.common.welcome}, {user.email}
          </p>
        </div>

        <AdminDashboardForm locale={locale} initialProfiles={profiles || []} />
      </div>
    </main>
  );
}
