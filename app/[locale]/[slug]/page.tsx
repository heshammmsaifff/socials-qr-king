import { WalletCard } from "@/components/wallet-card";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import {
  FaBriefcase,
  FaGlobe,
  FaCreditCard,
  FaChevronRight,
  FaArrowLeft,
} from "react-icons/fa6";
import { FaMapMarkerAlt, FaMobileAlt } from "react-icons/fa";
import Link from "next/link";
import { PlatformIcon, getPlatformConfig } from "@/lib/platforms";
import { getThemeConfig } from "@/lib/themes";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; slug: string }>;

export default async function PublicProfilePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale as Locale);

  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!hasEnv) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Fetch profile details
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // 2. Fetch active links
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const otherLocale = locale === "en" ? "ar" : "en";
  const otherLocaleName = locale === "en" ? "العربية" : "English";

  const isRtl = locale === "ar";
  const theme = getThemeConfig(profile.theme);

  return (
    <main
      className={`min-h-screen ${theme.textColor} flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b ${theme.mainBg} bg-cover bg-center`}
      style={
        profile.background_image_url
          ? { backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${profile.background_image_url})` }
          : undefined
      }
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Top Header Controls */}
      <div className="w-full max-w-md flex justify-end mb-8">
        <Link
          href={`/${otherLocale}/${slug}`}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold ${theme.textColor} transition-all shadow-md backdrop-blur-md ${theme.langBtnBg} ${theme.langBtnBorder}`}
        >
          <FaGlobe className={`w-4 h-4 ${theme.primaryColor}`} />
          <span>{otherLocaleName}</span>
        </Link>
      </div>

      {/* Main Card Wrapper */}
      <div className="flex-1 w-full max-w-md flex flex-col items-center gap-8">
        {/* Profile Logo */}
        {profile.logo_url ? (
          <img
            src={profile.logo_url}
            alt={locale === "ar" ? (profile.company_name_ar || profile.company_name_en || slug) : (profile.company_name_en || profile.company_name_ar || slug)}
            className={`w-28 h-28 rounded-full object-cover border-4 shadow-xl ${theme.logoBorder}`}
          />
        ) : (
          <div className={`w-28 h-28 rounded-full bg-slate-800 border-4 flex items-center justify-center shadow-xl ${theme.logoBorder}`}>
            <FaBriefcase className="w-12 h-12 text-slate-500" />
          </div>
        )}

        {/* Company Identity */}
        <div className="text-center flex flex-col gap-2">
          <h1 className={`text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${theme.companyNameColor}`}>
            {locale === "ar"
              ? (profile.company_name_ar || profile.company_name_en || slug)
              : (profile.company_name_en || profile.company_name_ar || slug)}
          </h1>
          {(() => {
            const address = locale === "ar"
              ? (profile.company_address_ar || profile.company_address_en || profile.company_address)
              : (profile.company_address_en || profile.company_address_ar || profile.company_address);

            if (!address) return null;

            return profile.location ? (
              <a
                href={profile.location}
                target="_blank"
                rel="noopener noreferrer"
                className={`transition text-sm flex items-center justify-center gap-1.5 hover:underline hover:opacity-80 ${theme.subTextColor}`}
              >
                <FaMapMarkerAlt className={`w-3.5 h-3.5 ${theme.primaryColor}`} />
                <span>{address}</span>
              </a>
            ) : (
              <p className={`text-sm flex items-center justify-center gap-1.5 ${theme.subTextColor}`}>
                <FaMapMarkerAlt className={`w-3.5 h-3.5 ${theme.primaryColor}`} />
                <span>{address}</span>
              </p>
            );
          })()}
        </div>

        {/* Social Links List */}
        <div className="w-full flex flex-col gap-4 mt-4">
          {links && links.length > 0 ? (
            links.map((link) => {
              const platform = getPlatformConfig(link.platform_name);
              const platformDisplayName = platform
                ? (locale === "ar" ? platform.ar : platform.en)
                : link.platform_name;
              const iconName = platform ? platform.iconName : "FaGlobe";

              const isMobileCall = link.platform_name === "mobile_call";
              const isWhatsApp = link.platform_name === "whatsapp";
              let href = link.url;
              if (isMobileCall) {
                href = link.url.startsWith("tel:") ? link.url : `tel:${link.url}`;
              } else if (isWhatsApp) {
                const urlTrimmed = link.url.trim();
                if (urlTrimmed.startsWith("http://") || urlTrimmed.startsWith("https://") || urlTrimmed.startsWith("wa.me")) {
                  href = urlTrimmed.startsWith("wa.me") ? `https://${urlTrimmed}` : urlTrimmed;
                } else {
                  let phone = urlTrimmed.replace(/[+\s-]/g, "");
                  if (phone.startsWith("0")) {
                     phone = "2" + phone;
                  }
                  href = `https://wa.me/${phone}`;
                }
              }

              return (
                <a
                  key={link.id}
                  href={href}
                  target={isMobileCall ? undefined : "_blank"}
                  rel={isMobileCall ? undefined : "noopener noreferrer"}
                  className={`group w-full py-4 px-6 border rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md flex justify-between items-center ${theme.linkBg} ${theme.linkBorder} ${theme.linkHoverBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <PlatformIcon name={iconName} className={`w-5 h-5 ${theme.primaryColor} transition-colors`} />
                    <span className={`transition-colors ${theme.linkText}`}>
                      {platformDisplayName}
                    </span>
                  </div>
                  <FaChevronRight className={`w-3.5 h-3.5 ${theme.primaryColor} group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-all`} />
                </a>
              );
            })
          ) : (
            <p className={`text-center text-sm py-6 ${theme.subTextColor}`}>
              {dict.common.noLinks}
            </p>
          )}

          {/* Payments Card (Instapay & Wallet) */}
          {(() => {
            const instapayLinks = profile.instapay_link
              ? profile.instapay_link.split(",").map((l: string) => l.trim()).filter(Boolean)
              : [];
            const walletNumbers = profile.wallet_number
              ? profile.wallet_number.split(",").map((w: string) => w.trim()).filter(Boolean)
              : [];

            if (instapayLinks.length === 0 && walletNumbers.length === 0) return null;

            return (
              <div className={`w-full p-5 rounded-2xl border backdrop-blur-sm flex flex-col gap-4 mt-6 ${theme.payCardBg} ${theme.payCardBorder}`}>
                <h3 className={`font-extrabold text-sm pb-2 uppercase tracking-wide border-b border-current/10 ${theme.cardTitleColor}`}>
                  💳 {locale === "ar" ? "وسائل الدفع" : "Payment Options"}
                </h3>

                <div className="flex flex-col gap-3">
                  {instapayLinks.map((link: string, idx: number) => (
                    <a
                      key={`insta-${idx}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl transition ${theme.payInstaBg}`}
                    >
                      <div className={`p-2 rounded shrink-0 ${theme.payInstaIconBg} ${theme.payInstaIconText}`}>
                        <FaCreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-left rtl:text-right">
                        <span className={`font-bold text-sm ${theme.textColor}`}>
                          {locale === "ar" ? "إنستا باي" : "Instapay"} {instapayLinks.length > 1 ? `#${idx + 1}` : ""}
                        </span>
                        <span className={`text-xs ${theme.subTextColor}`}>
                          {locale === "ar" ? "ادفع مباشرة عبر إنستا باي" : "Pay directly via Instapay"}
                        </span>
                      </div>
                    </a>
                  ))}

                  {walletNumbers.map((wallet: string, idx: number) => (
                    <WalletCard
                      key={`wallet-${idx}`}
                      wallet={wallet}
                      label={`${dict.common.wallet}${walletNumbers.length > 1 ? ` #${idx + 1}` : ""}`}
                      theme={theme}
                      locale={locale}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Footer */}
      <footer className={`w-full text-center text-xs mt-16 ${theme.subTextColor}`}>
        <p>
          {dict.common.poweredBy}{" "}
          <a
            href="https://www.facebook.com/kingfirm1"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-bold hover:underline ${theme.primaryColor}`}
          >
            {locale === "ar" ? "الملك للطباعة" : "King Printing"}
          </a>
        </p>
      </footer>
    </main>
  );
}
