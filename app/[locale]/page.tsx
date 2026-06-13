import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FaGlobe, FaChevronRight } from "react-icons/fa6";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string }>;

export default async function Home({ params }: { params: Params }) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);
  
  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let user = null;
  if (hasEnv) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getClaims();
      user = data?.claims;
    } catch (e) {
      console.error("Supabase connection error:", e);
    }
  }

  const otherLocale = locale === "en" ? "ar" : "en";
  const otherLocaleName = locale === "en" ? "العربية" : "English";

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-background via-background/95 to-accent/20">
      {/* Header Navigation */}
      <header className="w-full flex justify-center border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center p-4 px-6 text-sm">
          <div className="flex gap-2 items-center font-bold text-lg tracking-tight">
            <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">QR</span>
            <span>{dict.common.title}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher Link */}
            <Link
              href={`/${otherLocale}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-accent transition text-xs font-semibold"
              title={dict.common.selectLanguage}
            >
              <FaGlobe className="text-muted-foreground w-3.5 h-3.5" />
              <span>{otherLocaleName}</span>
            </Link>

            <ThemeSwitcher />
            
            <Suspense fallback={<div className="h-8 w-16 bg-accent rounded animate-pulse" />}>
              <AuthButton locale={locale} />
            </Suspense>
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl px-6 py-20 text-center gap-8">
        {!hasEnv && (
          <div className="w-full max-w-md p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm mb-4 animate-pulse">
            ⚠️ <strong>Configuration Required:</strong> Please add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in your <code>.env.local</code> file to connect Supabase.
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider animate-fade-in">
          🚀 Next.js 15 & Supabase
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80">
          {dict.common.welcome}
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          {dict.common.subtitle}
        </p>

        {hasEnv && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center items-center">
            {user ? (
              <Link
                href={`/${locale}/admin`}
                className="group flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <span>{dict.common.admin}</span>
                <FaChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rlt:rotate-180 rlt:group-hover:-translate-x-1" />
              </Link>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="group flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <span>{dict.common.signIn}</span>
                <FaChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 rlt:rotate-180 rlt:group-hover:-translate-x-1" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t border-border/40 mx-auto text-center text-xs text-muted-foreground gap-4 py-8">
        <p>
          {dict.common.poweredBy}{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            className="font-bold hover:underline text-foreground"
            rel="noreferrer"
          >
            Supabase
          </a>{" "}
          &{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-bold hover:underline text-foreground"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
      </footer>
    </main>
  );
}
