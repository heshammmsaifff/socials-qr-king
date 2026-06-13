import type { Metadata } from "next";
import { Alexandria, Roboto_Condensed } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "QR Socials",
  description: "Your premium Linktree clone and social hub builder",
};

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  preload: false,
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-english",
  preload: false,
});

type Params = Promise<{ locale: string }>;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${robotoCondensed.variable} ${alexandria.variable} ${
          locale === "ar" ? "font-arabic" : "font-english"
        } antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
