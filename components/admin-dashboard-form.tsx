"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { PLATFORMS, PlatformIcon, getPlatformConfig } from "@/lib/platforms";
import { THEMES, getThemeConfig } from "@/lib/themes";
import {
  FaUser,
  FaLink,
  FaTrash,
  FaPlus,
  FaCheck,
  FaSpinner,
  FaFolderPlus,
  FaListUl,
  FaArrowUp,
  FaArrowDown,
  FaGlobe,
  FaChevronRight,
  FaBriefcase,
  FaCreditCard,
  FaArrowLeft,
  FaPen,
  FaQrcode,
  FaUpload,
} from "react-icons/fa6";
import { FaExternalLinkAlt, FaMapMarkerAlt, FaMobileAlt } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import imageCompression from "browser-image-compression";

interface Profile {
  id: string;
  company_name_en: string | null;
  company_name_ar: string | null;
  company_address: string | null;
  company_address_en: string | null;
  company_address_ar: string | null;
  logo_url: string | null;
  background_image_url: string | null;
  instapay_link: string | null;
  wallet_number: string | null;
  slug: string;
  location: string | null;
  theme: string | null;
  updated_at?: string;
}

interface LinkItem {
  id: number;
  profile_id: string;
  platform_name: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

interface AdminDashboardFormProps {
  locale: string;
  initialProfiles: Profile[];
}

const getBustUrl = (url: string | null | undefined, updatedAt?: string) => {
  if (!url) return undefined;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;
  const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : "";
  return cacheBuster ? `${url}?t=${cacheBuster}` : url;
};

// Mobile Mockup Preview Component
function MobilePreview({
  profile,
  links,
  locale,
}: {
  profile: Partial<Profile>;
  links: LinkItem[];
  locale: string;
}) {
  const dict = getDictionary(locale as Locale);
  const theme = getThemeConfig(profile.theme);

  const mockupRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (!mockupRef.current) return;
    setDownloading(true);
    setIsExporting(true);
    
    // Allow state change to render in the DOM before capturing
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(mockupRef.current, {
        quality: 1.0,
        pixelRatio: 3, // Ultra-high resolution 3x scale!
        cacheBust: true,
        backgroundColor: "transparent", // Transparent background so it blends anywhere
      });

      const link = document.createElement("a");
      link.download = `${profile.slug || "mockup"}-preview.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsExporting(false);
      setDownloading(false);
    }
  };

  // Format localized display name
  const displayName =
    locale === "ar"
      ? profile.company_name_ar ||
        profile.company_name_en ||
        profile.slug ||
        "اسم الشركة"
      : profile.company_name_en ||
        profile.company_name_ar ||
        profile.slug ||
        "Company Name";

  const displayAddress =
    locale === "ar"
      ? profile.company_address_ar ||
        profile.company_address_en ||
        profile.company_address
      : profile.company_address_en ||
        profile.company_address_ar ||
        profile.company_address;

  const otherLocaleName = locale === "en" ? "العربية" : "English";

  const isLight =
    theme.textColor.includes("text-zinc-900") ||
    theme.textColor.includes("text-slate-800") ||
    theme.textColor.includes("text-rose-950") ||
    theme.textColor.includes("text-teal-950");
  const statusBarColor = isLight ? "text-zinc-800" : "text-white/80";

  return (
    <div className="relative mx-auto flex flex-col items-center gap-2">
      {/* Outer Wrapper for Image Export (captures shadows and buttons without clipping) */}
      <div ref={mockupRef} className={cn("bg-transparent flex items-center justify-center select-none", isExporting ? "p-1.5" : "p-8")}>
        {/* iPhone Outer Titanium Band/Bezel */}
        <div 
          className={cn(
            "w-[304px] h-[610px] bg-gradient-to-tr from-[#1c1c1e] via-[#2c2c2e] to-[#1c1c1e] rounded-[3.5rem] p-[7px] border border-[#3a3a3c]/40 relative flex flex-col select-none",
            isExporting
              ? "shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.5)]"
              : "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.5)]"
          )}
        >
          
          {/* Antenna bands (Sleek side cuts) */}
          <div className="absolute -left-[1px] top-[40px] w-[2px] h-[8px] bg-neutral-600/60 z-20" />
          <div className="absolute -right-[1px] top-[40px] w-[2px] h-[8px] bg-neutral-600/60 z-20" />
          <div className="absolute -left-[1px] bottom-[40px] w-[2px] h-[8px] bg-neutral-600/60 z-20" />
          <div className="absolute -right-[1px] bottom-[40px] w-[2px] h-[8px] bg-neutral-600/60 z-20" />

          {/* Dynamic iPhone Side Buttons (Physical representations protruding slightly) */}
          {/* Silent Button (left) */}
          <div className="absolute -left-[4px] top-[80px] w-[4px] h-[16px] bg-gradient-to-r from-[#5a5a5c] via-[#8e8e93] to-[#5a5a5c] rounded-l shadow-[inset_1px_1px_1px_rgba(255,255,255,0.25)] border-y border-l border-neutral-700/50 z-20" />
          {/* Volume Up Button (left) */}
          <div className="absolute -left-[4px] top-[115px] w-[4px] h-[40px] bg-gradient-to-r from-[#5a5a5c] via-[#8e8e93] to-[#5a5a5c] rounded-l shadow-[inset_1px_1px_1px_rgba(255,255,255,0.25)] border-y border-l border-neutral-700/50 z-20" />
          {/* Volume Down Button (left) */}
          <div className="absolute -left-[4px] top-[170px] w-[4px] h-[40px] bg-gradient-to-r from-[#5a5a5c] via-[#8e8e93] to-[#5a5a5c] rounded-l shadow-[inset_1px_1px_1px_rgba(255,255,255,0.25)] border-y border-l border-neutral-700/50 z-20" />
          {/* Power Button (right) */}
          <div className="absolute -right-[4px] top-[140px] w-[4px] h-[65px] bg-gradient-to-l from-[#5a5a5c] via-[#8e8e93] to-[#5a5a5c] rounded-r shadow-[inset_-1px_1px_1px_rgba(255,255,255,0.25)] border-y border-r border-neutral-700/50 z-20" />

          {/* Inner Screen Bezel (Pure Black Border) */}
          <div className="flex-1 bg-black rounded-[3rem] p-[4px] relative flex flex-col overflow-hidden shadow-[inset_0_0_12px_rgba(0,0,0,0.95)] border border-neutral-900/60">
            
            {/* Glass Glossy diagonal sheen reflection */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.03)_45%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.03)_55%,rgba(255,255,255,0)_70%)] pointer-events-none z-30 rounded-[2.75rem]" />

            {/* Speaker Ear Piece Grill */}
            <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-12 h-[3px] bg-neutral-950 rounded-full z-50 border-t border-white/10" />

            {/* Dynamic Island (iPhone style pill) */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[88px] h-[22px] bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_0_4px_rgba(255,255,255,0.1)] border border-neutral-800/40">
              {/* Camera lens glare */}
              <div className="w-[8px] h-[8px] bg-[#020205] rounded-full border border-neutral-900 flex items-center justify-center">
                <div className="w-[2.5px] h-[2.5px] bg-[#0f113a] rounded-full opacity-65" />
              </div>
              {/* Pulse Indicator green dot simulation */}
              <div className="w-1 h-1 bg-green-500 rounded-full opacity-0 animate-pulse" />
              {/* Sensor / Projector */}
              <div className="w-2 h-2 bg-[#050505] rounded-full" />
            </div>

            {/* iOS Status Bar (Below the bezel but above content) */}
            <div className={`absolute top-4 left-0 right-0 h-6 px-6 z-40 flex justify-between items-center text-[9px] font-bold tracking-tight ${statusBarColor}`}>
              {/* Time (left) */}
              <span>9:41</span>
              
              {/* Status Icons (right) */}
              <div className="flex items-center gap-1.5">
                {/* Cellular Signal Icons */}
                <div className="flex items-end gap-[1px] h-2">
                  <div className="w-[2px] h-[3px] bg-current rounded-2xs" />
                  <div className="w-[2px] h-[4.5px] bg-current rounded-2xs" />
                  <div className="w-[2px] h-[6px] bg-current rounded-2xs" />
                  <div className="w-[2px] h-[7.5px] bg-current rounded-2xs" />
                </div>
                
                {/* Wifi Icon Representation */}
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 16 16">
                  <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3 12.44 12.44 0 0 0 .663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.204.148.489.13.668-.049z"/>
                  <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 5c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 6c1.69 0 3.243.497 4.577 1.353a.526.526 0 0 0 .652-.082z"/>
                  <path d="M10.967 10.375a.477.477 0 0 0-.083-.755A6.471 6.471 0 0 0 8 7c-1.295 0-2.484.38-3.484.97-.197.127-.263.385-.083.754a.531.531 0 0 0 .633.093A5.478 5.478 0 0 1 8 8c.883 0 1.704.223 2.334.618a.53.53 0 0 0 .633-.093z"/>
                  <path d="M8.5 11.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                </svg>

                {/* Battery Icon Representation */}
                <div className="w-[15px] h-[8px] border border-current rounded-2xs p-[1px] flex items-center relative">
                  <div className="bg-current h-full w-[9px] rounded-3xs" />
                  <div className="w-[1.5px] h-[3px] bg-current rounded-r-3xs absolute -right-[2.5px] top-[1.5px]" />
                </div>
              </div>
            </div>

            {/* Inner Screen Content - Simulated webpage */}
            <div 
              key={profile.theme || "default"}
              className={`flex-1 overflow-y-auto no-scrollbar ${theme.textColor} flex flex-col items-center justify-between p-4 pt-12 pb-5 bg-gradient-to-b ${theme.mainBg} bg-cover bg-center ${
                profile.background_image_url ? "profile-bg-overlay" : ""
              }`}
              style={
                profile.background_image_url
                  ? { "--profile-bg-url": `url(${getBustUrl(profile.background_image_url, profile.updated_at)})` } as React.CSSProperties
                  : undefined
              }
            >
              
              {/* Language Switcher Simulation */}
              <div className="w-full flex justify-end mb-3 shrink-0">
                <div 
                  style={{ animationDelay: "50ms" }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold animate-premium-enter ${theme.textColor} ${theme.langBtnBg} ${theme.langBtnBorder}`}
                >
                  <FaGlobe className={`w-2.5 h-2.5 ${theme.primaryColor}`} />
                  <span>{otherLocaleName}</span>
                </div>
              </div>

              {/* Body content */}
              <div className="w-full flex flex-col items-center gap-3.5 flex-1">
                {/* Logo */}
                {profile.logo_url ? (
                  <img
                    src={getBustUrl(profile.logo_url, profile.updated_at)}
                    alt="Logo"
                    crossOrigin="anonymous"
                    style={{ animationDelay: "150ms" }}
                    className={`w-14 h-14 rounded-full object-cover border shadow-md animate-premium-enter ${theme.logoBorder}`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div 
                    style={{ animationDelay: "150ms" }}
                    className={`w-14 h-14 rounded-full bg-slate-800 border flex items-center justify-center shadow-md animate-premium-enter ${theme.logoBorder}`}
                  >
                    <FaBriefcase className="w-6 h-6 text-slate-500" />
                  </div>
                )}

                {/* Identity */}
                <div 
                  style={{ animationDelay: "250ms" }}
                  className="text-center flex flex-col gap-0.5 w-full px-1 animate-premium-enter"
                >
                  <h1 className={`text-xs font-extrabold truncate bg-clip-text text-transparent bg-gradient-to-r ${theme.companyNameColor}`}>
                    {displayName}
                  </h1>
                  {displayAddress && profile.location && (
                    <p className={`text-[9px] flex items-center justify-center gap-1 truncate ${theme.subTextColor}`}>
                      <FaMapMarkerAlt className={`w-2 h-2 shrink-0 ${theme.primaryColor}`} />
                      <span className="truncate">{displayAddress}</span>
                    </p>
                  )}
                </div>

                {/* Links list */}
                <div className="w-full flex flex-col gap-1.5 mt-1">
                  {links && links.length > 0 ? (
                    links.map((link, idx) => {
                      if (!link.is_active) return null;
                      const platform = getPlatformConfig(link.platform_name);
                      const platformDisplayName = platform
                        ? locale === "ar"
                          ? platform.ar
                          : platform.en
                        : link.platform_name;
                      const iconName = platform ? platform.iconName : "FaGlobe";

                      return (
                        <div
                          key={link.id}
                          style={{ animationDelay: `${350 + idx * 80}ms` }}
                          className={`w-full py-1.5 px-2.5 border rounded-xl font-bold flex justify-between items-center text-[10px] animate-premium-enter ${theme.linkBg} ${theme.linkBorder} ${theme.linkHoverBorder}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <PlatformIcon
                              name={iconName}
                              className={`w-3 h-3 ${theme.primaryColor}`}
                            />
                            <span className={`truncate ${theme.linkText}`}>
                              {platformDisplayName}
                            </span>
                          </div>
                          <FaChevronRight className={`w-2 h-2 ${theme.primaryColor}`} />
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-center text-[9px] py-3 ${theme.subTextColor}`}>
                      {dict.common.noLinks}
                    </p>
                  )}
                </div>

                {/* Payments Widgets */}
                {(() => {
                  const instapayLinks = profile.instapay_link
                    ? profile.instapay_link.split(",").map((l) => l.trim()).filter(Boolean)
                    : [];
                  const walletNumbers = profile.wallet_number
                    ? profile.wallet_number.split(",").map((w) => w.trim()).filter(Boolean)
                    : [];

                  if (instapayLinks.length === 0 && walletNumbers.length === 0) return null;

                  return (
                    <div 
                      style={{ animationDelay: `${350 + (links ? links.filter(l => l.is_active).length : 0) * 80 + 100}ms` }}
                      className={`w-full p-2.5 rounded-xl border flex flex-col gap-1.5 mt-2 text-left rtl:text-right animate-premium-enter ${theme.payCardBg} ${theme.payCardBorder}`}
                    >
                      <span className={`font-extrabold text-[8px] border-b border-current/10 pb-0.5 uppercase ${theme.cardTitleColor}`}>
                        💳 {locale === "ar" ? "وسائل الدفع" : "Payment Options"}
                      </span>

                      <div className="flex flex-col gap-1">
                        {instapayLinks.map((link, idx) => (
                          <div key={`insta-${idx}`} className={`flex items-center gap-1.5 p-1 rounded text-[9px] ${theme.payInstaBg}`}>
                            <div className={`p-0.5 rounded shrink-0 ${theme.payInstaIconBg} ${theme.payInstaIconText}`}>
                              <FaCreditCard className="w-2.5 h-2.5" />
                            </div>
                            <div className="flex flex-col truncate text-left rtl:text-right">
                              <span className={`font-bold ${theme.textColor}`}>
                                {locale === "ar" ? "إنستا باي" : "Instapay"} {instapayLinks.length > 1 ? `#${idx + 1}` : ""}
                              </span>
                            </div>
                          </div>
                        ))}

                        {walletNumbers.map((wallet, idx) => (
                          <div key={`wallet-${idx}`} className={`flex items-center gap-1.5 p-1 rounded border text-[9px] ${theme.payWalletBg} ${theme.payWalletBorder}`}>
                            <div className={`p-0.5 rounded shrink-0 ${theme.payWalletIconBg} ${theme.payWalletIconText}`}>
                              <FaMobileAlt className="w-2.5 h-2.5" />
                            </div>
                            <div className="flex flex-col truncate text-left rtl:text-right">
                              <span className={`font-bold ${theme.textColor}`}>
                                {dict.common.wallet} {walletNumbers.length > 1 ? `#${idx + 1}` : ""}
                              </span>
                              <span className={`text-[8px] font-mono truncate ${theme.subTextColor}`}>
                                {wallet}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <footer 
                style={{ animationDelay: `${350 + (links ? links.filter(l => l.is_active).length : 0) * 80 + 180}ms` }}
                className={`w-full text-center text-[8px] mt-2 shrink-0 animate-premium-enter ${theme.subTextColor}`}
              >
                <p>
                  {dict.common.poweredBy}{" "}
                  <span className={`font-bold ${theme.primaryColor}`}>
                    {locale === "ar" ? "الملك للطباعة" : "King Printing"}
                  </span>
                </p>
              </footer>
            </div>

            {/* iPhone Home Indicator bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-[3.5px] bg-current/30 rounded-full z-50 pointer-events-none" />
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="w-full max-w-[280px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 rounded-xl py-2 shadow-md hover:shadow-lg transition-all text-xs"
      >
        {downloading ? (
          <>
            <FaSpinner className="animate-spin w-4 h-4 text-slate-400" />
            <span>{locale === "ar" ? "جاري توليد الصورة..." : "Generating Image..."}</span>
          </>
        ) : (
          <>
            <FaMobileAlt className="w-4 h-4 text-slate-400" />
            <span>{locale === "ar" ? "تحميل صورة الموك آب" : "Download Mockup Image"}</span>
          </>
        )}
      </Button>
    </div>
  );
}

export function AdminDashboardForm({
  locale,
  initialProfiles,
}: AdminDashboardFormProps) {
  const dict = getDictionary(locale as Locale);
  const supabase = createClient();

  // Navigation View State
  const [view, setView] = useState<"list" | "edit" | "create">("list");

  // State Lists
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    initialProfiles.length > 0 ? initialProfiles[0].id : null,
  );

  // Editing Profile State
  const [editingProfile, setEditingProfile] = useState<Profile | null>(
    initialProfiles.length > 0 ? initialProfiles[0] : null,
  );
  const [activeQrModalProfile, setActiveQrModalProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Links States (specifically for the selected profile)
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksFetchLoading, setLinksFetchLoading] = useState(false);
  const [newLinkPlatform, setNewLinkPlatform] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkActive, setNewLinkActive] = useState(true);
  const [linksLoading, setLinksLoading] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);

  // File upload states for Creation Form
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newBgFile, setNewBgFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState("");
  const [newBgPreview, setNewBgPreview] = useState("");

  // File upload states for Edit Form
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editBgFile, setEditBgFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState("");
  const [editBgPreview, setEditBgPreview] = useState("");

  // Cleanup & loading state
  const [cleanLoading, setCleanLoading] = useState(false);

  // Creation State
  const [newSlug, setNewSlug] = useState("");
  const [newCompanyNameEn, setNewCompanyNameEn] = useState("");
  const [newCompanyNameAr, setNewCompanyNameAr] = useState("");
  const [newCompanyAddressEn, setNewCompanyAddressEn] = useState("");
  const [newCompanyAddressAr, setNewCompanyAddressAr] = useState("");
  const [newInstapayLinks, setNewInstapayLinks] = useState<string[]>([""]);
  const [newWalletNumbers, setNewWalletNumbers] = useState<string[]>([""]);
  const [newLocation, setNewLocation] = useState("");
  const [newTheme, setNewTheme] = useState("theme1");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Helper function for compressing images and converting to WebP
  const compressAndConvertToWebP = async (file: File, isLogo: boolean): Promise<Blob> => {
    const options = {
      maxSizeMB: isLogo ? 0.15 : 0.4,
      maxWidthOrHeight: isLogo ? 400 : 1920,
      useWebWorker: true,
      fileType: "image/webp",
    };
    return await imageCompression(file, options);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = (() => {
    if (view === "create") {
      return (
        newSlug !== "" ||
        newCompanyNameEn !== "" ||
        newCompanyNameAr !== "" ||
        newCompanyAddressEn !== "" ||
        newCompanyAddressAr !== "" ||
        newLogoFile !== null ||
        newBgFile !== null ||
        (newInstapayLinks.length > 1 || newInstapayLinks[0] !== "") ||
        (newWalletNumbers.length > 1 || newWalletNumbers[0] !== "") ||
        newLocation !== "" ||
        newTheme !== "theme1"
      );
    }
    if (view === "edit" && editingProfile) {
      const original = profiles.find((p) => p.id === editingProfile.id);
      if (!original) return false;

      const clean = (val: string | null) => (val || "").trim();

      return (
        editLogoFile !== null ||
        editBgFile !== null ||
        clean(editingProfile.slug) !== clean(original.slug) ||
        clean(editingProfile.company_name_en) !== clean(original.company_name_en) ||
        clean(editingProfile.company_name_ar) !== clean(original.company_name_ar) ||
        clean(editingProfile.company_address_en) !== clean(original.company_address_en) ||
        clean(editingProfile.company_address_ar) !== clean(original.company_address_ar) ||
        clean(editingProfile.logo_url) !== clean(original.logo_url) ||
        clean(editingProfile.background_image_url) !== clean(original.background_image_url) ||
        clean(editingProfile.instapay_link) !== clean(original.instapay_link) ||
        clean(editingProfile.wallet_number) !== clean(original.wallet_number) ||
        clean(editingProfile.location) !== clean(original.location) ||
        clean(editingProfile.theme) !== clean(original.theme)
      );
    }
    return false;
  })();

  // 1. Browser Refresh/Unload Guard (for browser reload button and tab close)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Keyboard Reload (F5 / Ctrl+R / Cmd+R) Guard with SweetAlert2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isReload =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"));

      if (hasUnsavedChanges && isReload) {
        e.preventDefault();
        import("sweetalert2").then((Swal) => {
          Swal.default.fire({
            title: locale === "ar" ? "تعديلات غير محفوظة!" : "Unsaved Changes!",
            text: locale === "ar"
              ? "لديك تعديلات غير محفوظة. إذا قمت بإعادة تحميل الصفحة الآن، فقد تفقد هذه التعديلات. هل تريد إعادة التحميل على أي حال؟"
              : "You have unsaved changes. If you reload now, you may lose them. Do you want to reload anyway?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: locale === "ar" ? "نعم، أعد التحميل" : "Yes, reload",
            cancelButtonText: locale === "ar" ? "تراجع واستكمال التعديل" : "Stay and edit",
            background: "rgb(15 23 42)",
            color: "#f8fafc",
            customClass: {
              popup: "rounded-2xl border border-slate-700/60 shadow-xl"
            }
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasUnsavedChanges, locale]);

  // 2. SPA Navigation Guard (using SweetAlert2)
  const handleNavigate = (action: () => void) => {
    if (hasUnsavedChanges) {
      import("sweetalert2").then((Swal) => {
        Swal.default.fire({
          title: locale === "ar" ? "تعديلات غير محفوظة!" : "Unsaved Changes!",
          text: locale === "ar"
            ? "لديك تعديلات غير محفوظة. إذا غادرت الآن، فقد تفقد هذه التعديلات. هل تريد المغادرة على أي حال؟"
            : "You have unsaved changes. If you leave now, you may lose them. Do you want to leave anyway?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#64748b",
          confirmButtonText: locale === "ar" ? "نعم، غادر" : "Yes, leave",
          cancelButtonText: locale === "ar" ? "تراجع واستكمال التعديل" : "Stay and edit",
          background: "rgb(15 23 42)",
          color: "#f8fafc",
          customClass: {
            popup: "rounded-2xl border border-slate-700/60 shadow-xl"
          }
        }).then((result) => {
          if (result.isConfirmed) {
            action();
          }
        });
      });
    } else {
      action();
    }
  };

  // File Preview Effects
  useEffect(() => {
    if (newLogoFile) {
      const url = URL.createObjectURL(newLogoFile);
      setNewLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewLogoPreview("");
    }
  }, [newLogoFile]);

  useEffect(() => {
    if (newBgFile) {
      const url = URL.createObjectURL(newBgFile);
      setNewBgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setNewBgPreview("");
    }
  }, [newBgFile]);

  useEffect(() => {
    if (editLogoFile) {
      const url = URL.createObjectURL(editLogoFile);
      setEditLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setEditLogoPreview("");
    }
  }, [editLogoFile]);

  useEffect(() => {
    if (editBgFile) {
      const url = URL.createObjectURL(editBgFile);
      setEditBgPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setEditBgPreview("");
    }
  }, [editBgFile]);

  // Sync editing profile and fetch links when selected profile changes
  useEffect(() => {
    if (selectedProfileId) {
      const active = profiles.find((p) => p.id === selectedProfileId);
      if (active) {
        setEditingProfile(active);
        setProfileMessage(null);
        fetchLinks(active.id);
        setEditingLinkId(null);
        setNewLinkPlatform("");
        setNewLinkUrl("");
        setNewLinkActive(true);
        // Reset edit file uploads when switching profiles
        setEditLogoFile(null);
        setEditBgFile(null);
        setEditLogoPreview("");
        setEditBgPreview("");
      }
    } else {
      setEditingProfile(null);
      setLinks([]);
    }
  }, [selectedProfileId, profiles]);

  // Download SVG QR Code
  const downloadSVG = (slug: string) => {
    const svgElement = document.getElementById(`qr-svg-${slug}`);
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-${slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download PNG QR Code
  const downloadPNG = (slug: string) => {
    const svgElement = document.getElementById(`qr-svg-${slug}`);
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 1024, 1024);
      
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  // Fetch Links for a specific profile
  const fetchLinks = async (profileId: string) => {
    setLinksFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (err: unknown) {
      console.error("Error fetching links:", err);
    } finally {
      setLinksFetchLoading(false);
    }
  };

  // Create Profile Handler
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlug) return;
    setCreateLoading(true);
    setCreateError(null);

    const formattedSlug = newSlug.trim().toLowerCase().replace(/\s+/g, "-");

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const userId = userSession?.user?.id || null;

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          slug: formattedSlug,
          company_name_en: newCompanyNameEn || null,
          company_name_ar: newCompanyNameAr || null,
          company_address: newCompanyAddressAr || newCompanyAddressEn || null,
          company_address_en: newCompanyAddressEn || null,
          company_address_ar: newCompanyAddressAr || null,
          logo_url: null,
          background_image_url: null,
          instapay_link: newInstapayLinks.filter(Boolean).map((l) => l.trim()).join(",") || null,
          wallet_number: newWalletNumbers.filter(Boolean).map((w) => w.trim()).join(",") || null,
          location: newLocation || null,
          theme: newTheme,
          user_id: userId,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            locale === "ar"
              ? "رابط التعريف (slug) مستخدم بالفعل، يرجى اختيار اسم آخر."
              : "This slug is already taken. Please choose another one.",
          );
        }
        throw error;
      }

      let uploadedLogoUrl = null;
      let uploadedBgUrl = null;

      if (userId) {
        // Upload Logo if selected
        if (newLogoFile) {
          try {
            const compressedLogo = await compressAndConvertToWebP(newLogoFile, true);
            const path = `uploads/${userId}/logo_${data.id}.webp`;
            const { error: uploadError } = await supabase.storage
              .from("socials-assets")
              .upload(path, compressedLogo, {
                contentType: "image/webp",
                upsert: true,
              });
            if (uploadError) throw uploadError;
            uploadedLogoUrl = supabase.storage.from("socials-assets").getPublicUrl(path).data.publicUrl;
          } catch (uploadErr) {
            console.error("Error uploading logo:", uploadErr);
          }
        }

        // Upload Background if selected
        if (newBgFile) {
          try {
            const compressedBg = await compressAndConvertToWebP(newBgFile, false);
            const path = `uploads/${userId}/background_${data.id}.webp`;
            const { error: uploadError } = await supabase.storage
              .from("socials-assets")
              .upload(path, compressedBg, {
                contentType: "image/webp",
                upsert: true,
              });
            if (uploadError) throw uploadError;
            uploadedBgUrl = supabase.storage.from("socials-assets").getPublicUrl(path).data.publicUrl;
          } catch (uploadErr) {
            console.error("Error uploading background:", uploadErr);
          }
        }
      }

      // Update the profile row with actual public URLs if any were uploaded
      let updatedData = data;
      if (uploadedLogoUrl || uploadedBgUrl) {
        const { data: updateData, error: updateError } = await supabase
          .from("profiles")
          .update({
            logo_url: uploadedLogoUrl || null,
            background_image_url: uploadedBgUrl || null,
          })
          .eq("id", data.id)
          .select()
          .single();
        if (updateError) throw updateError;
        updatedData = updateData;
      }

      setProfiles([updatedData, ...profiles]);
      setSelectedProfileId(updatedData.id);
      setEditingProfile(updatedData);

      // Clear creation form fields
      setNewSlug("");
      setNewCompanyNameEn("");
      setNewCompanyNameAr("");
      setNewCompanyAddressEn("");
      setNewCompanyAddressAr("");
      setNewLogoFile(null);
      setNewBgFile(null);
      setNewInstapayLinks([""]);
      setNewWalletNumbers([""]);
      setNewLocation("");
      setNewTheme("theme1");

      // Switch view to edit page
      setView("edit");
    } catch (err: unknown) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create profile",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // Update Profile Details Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setProfileLoading(true);
    setProfileMessage(null);

    const formattedSlug = editingProfile.slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const userId = userSession?.user?.id || null;

      let finalLogoUrl = editingProfile.logo_url;
      let finalBgUrl = editingProfile.background_image_url;

      if (userId) {
        if (editLogoFile) {
          const compressedLogo = await compressAndConvertToWebP(editLogoFile, true);
          const path = `uploads/${userId}/logo_${editingProfile.id}.webp`;
          const { error: uploadError } = await supabase.storage
            .from("socials-assets")
            .upload(path, compressedLogo, {
              contentType: "image/webp",
              upsert: true,
            });
          if (uploadError) throw uploadError;
          finalLogoUrl = supabase.storage.from("socials-assets").getPublicUrl(path).data.publicUrl;
        } else if (!editingProfile.logo_url) {
          try {
            const path = `uploads/${userId}/logo_${editingProfile.id}.webp`;
            await supabase.storage.from("socials-assets").remove([path]);
          } catch (delErr) {
            console.error("Failed to delete logo from storage:", delErr);
          }
          finalLogoUrl = null;
        }

        if (editBgFile) {
          const compressedBg = await compressAndConvertToWebP(editBgFile, false);
          const path = `uploads/${userId}/background_${editingProfile.id}.webp`;
          const { error: uploadError } = await supabase.storage
            .from("socials-assets")
            .upload(path, compressedBg, {
              contentType: "image/webp",
              upsert: true,
            });
          if (uploadError) throw uploadError;
          finalBgUrl = supabase.storage.from("socials-assets").getPublicUrl(path).data.publicUrl;
        } else if (!editingProfile.background_image_url) {
          try {
            const path = `uploads/${userId}/background_${editingProfile.id}.webp`;
            await supabase.storage.from("socials-assets").remove([path]);
          } catch (delErr) {
            console.error("Failed to delete background from storage:", delErr);
          }
          finalBgUrl = null;
        }
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name_en: editingProfile.company_name_en,
          company_name_ar: editingProfile.company_name_ar,
          company_address: editingProfile.company_address_ar || editingProfile.company_address_en || null,
          company_address_en: editingProfile.company_address_en,
          company_address_ar: editingProfile.company_address_ar,
          logo_url: finalLogoUrl,
          background_image_url: finalBgUrl,
          instapay_link: editingProfile.instapay_link,
          wallet_number: editingProfile.wallet_number,
          slug: formattedSlug,
          location: editingProfile.location,
          theme: editingProfile.theme,
        })
        .eq("id", editingProfile.id);

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            locale === "ar"
              ? "رابط التعريف (slug) مستخدم بالفعل، يرجى اختيار اسم آخر."
              : "This slug is already taken. Please choose another one.",
          );
        }
        throw error;
      }

      const updatedProfile = {
        ...editingProfile,
        slug: formattedSlug,
        logo_url: finalLogoUrl,
        background_image_url: finalBgUrl,
      };

      setProfiles(
        profiles.map((p) =>
          p.id === editingProfile.id
            ? updatedProfile
            : p,
        ),
      );
      setEditingProfile(updatedProfile);
      setEditLogoFile(null);
      setEditBgFile(null);

      setProfileMessage({
        type: "success",
        text: dict.admin.profileUpdated,
      });
    } catch (err: unknown) {
      setProfileMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Delete Profile Handler
  const handleDeleteProfile = async (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (!target) return;

    if (
      !confirm(
        locale === "ar"
          ? `هل أنت متأكد من حذف الصفحة "${target.slug}" بالكامل؟`
          : `Are you sure you want to delete the page "${target.slug}" completely?`,
      )
    )
      return;

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const userId = userSession?.user?.id || null;

      if (userId) {
        const logoPath = `uploads/${userId}/logo_${profileId}.webp`;
        const bgPath = `uploads/${userId}/background_${profileId}.webp`;
        try {
          await supabase.storage.from("socials-assets").remove([logoPath, bgPath]);
        } catch (storageErr) {
          console.error("Error deleting profile files from storage:", storageErr);
        }
      }

      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId);
      if (error) throw error;

      const remaining = profiles.filter((p) => p.id !== profileId);
      setProfiles(remaining);

      if (selectedProfileId === profileId) {
        if (remaining.length > 0) {
          setSelectedProfileId(remaining[0].id);
        } else {
          setSelectedProfileId(null);
          setEditingProfile(null);
        }
        setView("list");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete page");
    }
  };

  // Clean Unused Images Handler
  const handleCleanUnusedImages = async () => {
    const confirmText = locale === "ar"
      ? "هل أنت متأكد من حذف جميع الصور غير المستخدمة في أي slug؟ سيؤدي هذا لتوفير المساحة."
      : "Are you sure you want to delete all unused images across all your slugs? This will free up storage space.";
    if (!confirm(confirmText)) return;

    setCleanLoading(true);

    try {
      const { data: userSession } = await supabase.auth.getUser();
      const userId = userSession?.user?.id;
      if (!userId) throw new Error("User session not found");

      const userFolder = `uploads/${userId}`;
      const { data: files, error: listError } = await supabase.storage
        .from("socials-assets")
        .list(userFolder);

      if (listError) throw listError;

      if (!files || files.length === 0) {
        alert(
          locale === "ar"
            ? "لا توجد صور في المجلد الخاص بك لحذفها."
            : "No images found in your folder to clean up."
        );
        return;
      }

      const activeUrls = new Set<string>();
      profiles.forEach((p) => {
        if (p.logo_url) activeUrls.add(p.logo_url);
        if (p.background_image_url) activeUrls.add(p.background_image_url);
      });

      const filesToDelete: string[] = [];
      for (const file of files) {
        if (file.metadata && file.metadata.mimetype === undefined) {
          continue; // It's a directory
        }

        const filePath = `${userFolder}/${file.name}`;
        const filePublicUrl = supabase.storage.from("socials-assets").getPublicUrl(filePath).data.publicUrl;

        if (!activeUrls.has(filePublicUrl)) {
          filesToDelete.push(filePath);
        }
      }

      if (filesToDelete.length === 0) {
        alert(
          locale === "ar"
            ? "جميع الصور الموجودة مستخدمة حالياً. لا يوجد شيء لحذفه."
            : "All existing images are currently in use. Nothing to clean up."
        );
        return;
      }

      const { error: deleteError } = await supabase.storage
        .from("socials-assets")
        .remove(filesToDelete);

      if (deleteError) throw deleteError;

      alert(
        locale === "ar"
          ? `تم تنظيف ${filesToDelete.length} من الصور غير المستخدمة بنجاح.`
          : `Successfully cleaned up ${filesToDelete.length} unused images.`
      );
    } catch (err: unknown) {
      console.error("Cleanup error:", err);
      alert(
        err instanceof Error ? err.message : "Failed to clean up unused images"
      );
    } finally {
      setCleanLoading(false);
    }
  };

  // Save Link Handler (handles both Adding and Editing)
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId || !newLinkPlatform || !newLinkUrl) return;
    setLinksLoading(true);

    try {
      if (editingLinkId) {
        // Edit Mode
        const { error } = await supabase
          .from("links")
          .update({
            platform_name: newLinkPlatform,
            url: newLinkUrl,
            is_active: newLinkActive,
          })
          .eq("id", editingLinkId);

        if (error) throw error;

        setLinks(
          links.map((link) =>
            link.id === editingLinkId
              ? {
                  ...link,
                  platform_name: newLinkPlatform,
                  url: newLinkUrl,
                  is_active: newLinkActive,
                }
              : link
          )
        );
        setEditingLinkId(null);
      } else {
        // Add Mode
        const { data, error } = await supabase
          .from("links")
          .insert({
            profile_id: selectedProfileId,
            platform_name: newLinkPlatform,
            url: newLinkUrl,
            is_active: newLinkActive,
            sort_order: links.length,
          })
          .select()
          .single();

        if (error) throw error;

        setLinks([...links, data]);
      }

      setNewLinkPlatform("");
      setNewLinkUrl("");
      setNewLinkActive(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save link");
    } finally {
      setLinksLoading(false);
    }
  };

  // Toggle Link Active Handler
  const handleToggleLinkActive = async (
    linkId: number,
    currentStatus: boolean,
  ) => {
    try {
      const { error } = await supabase
        .from("links")
        .update({ is_active: !currentStatus })
        .eq("id", linkId);

      if (error) throw error;

      setLinks(
        links.map((link) =>
          link.id === linkId ? { ...link, is_active: !currentStatus } : link,
        ),
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to update link status",
      );
    }
  };

  // Delete Link Handler
  const handleDeleteLink = async (linkId: number) => {
    if (
      !confirm(
        locale === "ar"
          ? "هل أنت متأكد من حذف هذا الرابط؟"
          : "Are you sure you want to delete this link?",
      )
    )
      return;

    try {
      const { error } = await supabase.from("links").delete().eq("id", linkId);
      if (error) throw error;

      const remainingLinks = links.filter((link) => link.id !== linkId);
      const reindexed = remainingLinks.map((link, idx) => ({
        ...link,
        sort_order: idx,
      }));
      setLinks(reindexed);

      reindexed.forEach(async (link) => {
        await supabase
          .from("links")
          .update({ sort_order: link.sort_order })
          .eq("id", link.id);
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  // Move Link (sort_order swapping) Handler
  const handleMoveLink = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const linkA = links[index];
    const linkB = links[newIndex];

    const orderA = linkB.sort_order;
    const orderB = linkA.sort_order;

    const updatedLinks = [...links];
    updatedLinks[index] = { ...linkA, sort_order: orderA };
    updatedLinks[newIndex] = { ...linkB, sort_order: orderB };
    updatedLinks.sort((a, b) => a.sort_order - b.sort_order);
    setLinks(updatedLinks);

    try {
      const { error: errA } = await supabase
        .from("links")
        .update({ sort_order: orderA })
        .eq("id", linkA.id);

      const { error: errB } = await supabase
        .from("links")
        .update({ sort_order: orderB })
        .eq("id", linkB.id);

      if (errA || errB) throw errA || errB;
    } catch (err: unknown) {
      console.error("Failed to update link sorting in Supabase:", err);
      fetchLinks(selectedProfileId!);
    }
  };

  // ----------------------------------------------------
  // LIST VIEW RENDERING
  // ----------------------------------------------------
  if (view === "list") {
    return (
      <>
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border/40 shadow-sm gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaListUl className="w-5 h-5 text-primary" />
                <span>
                  {locale === "ar" ? "الصفحات الحالية" : "Current Pages"}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {locale === "ar"
                  ? "إدارة وتعديل صفحات الهبوط الخاصة بك"
                  : "Manage and edit your landing pages"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                disabled={cleanLoading}
                onClick={handleCleanUnusedImages}
                className="flex items-center gap-2 shadow-sm border-rose-500/25 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-500 transition-all"
              >
                {cleanLoading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
                <span>
                  {locale === "ar" ? "تنظيف الصور غير المستخدمة" : "Clean Unused Images"}
                </span>
              </Button>
              <Button
                onClick={() => {
                  setNewSlug("");
                  setNewCompanyNameEn("");
                  setNewCompanyNameAr("");
                  setNewCompanyAddressEn("");
                  setNewCompanyAddressAr("");
                  setNewLogoFile(null);
                  setNewBgFile(null);
                  setNewInstapayLinks([""]);
                  setNewWalletNumbers([""]);
                  setNewLocation("");
                  setCreateError(null);
                  setView("create");
                }}
                className="flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <FaFolderPlus className="w-4 h-4" />
                <span>
                  {locale === "ar" ? "إنشاء صفحة جديدة" : "Create New Page"}
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length > 0 ? (
            profiles.map((p) => {
              const displayName =
                locale === "ar"
                  ? p.company_name_ar || p.company_name_en || p.slug
                  : p.company_name_en || p.company_name_ar || p.slug;

              return (
                <div
                  key={p.id}
                  className="bg-card hover:bg-card/85 border border-border/50 hover:border-primary/30 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt="Logo"
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <FaBriefcase className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1 text-left rtl:text-right">
                      <span className="font-extrabold text-base truncate group-hover:text-primary transition-colors">
                        {displayName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground truncate">
                        /{p.slug}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const cardAddress = locale === "ar"
                      ? p.company_address_ar || p.company_address_en || p.company_address
                      : p.company_address_en || p.company_address_ar || p.company_address;
                    if (!cardAddress || !p.location) return null;
                    return (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                        <span className="truncate">{cardAddress}</span>
                      </p>
                    );
                  })()}

                  <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedProfileId(p.id);
                          setEditingProfile(p);
                          setView("edit");
                        }}
                        className="flex items-center gap-1 text-xs px-3 h-8"
                      >
                        <FaLink className="w-3 h-3" />
                        <span>{locale === "ar" ? "تعديل" : "Edit"}</span>
                      </Button>

                       <a
                        href={`/${locale}/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs gap-1"
                      >
                        <FaExternalLinkAlt className="w-3 h-3" />
                        <span>{locale === "ar" ? "زيارة" : "Visit"}</span>
                      </a>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveQrModalProfile(p)}
                        className="inline-flex items-center justify-center rounded-md font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs gap-1"
                      >
                        <FaQrcode className="w-3 h-3 text-primary" />
                        <span>{locale === "ar" ? "كود QR" : "QR"}</span>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleDeleteProfile(p.id)}
                      title={locale === "ar" ? "حذف الصفحة" : "Delete Page"}
                    >
                      <FaTrash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed rounded-2xl bg-card">
              <p className="text-muted-foreground mb-4 text-sm">
                {locale === "ar"
                  ? "لا توجد صفحات منشأة بعد."
                  : "No landing pages created yet."}
              </p>
              <Button
                onClick={() => setView("create")}
                className="flex items-center gap-2"
              >
                <FaFolderPlus className="w-4 h-4" />
                <span>
                  {locale === "ar" ? "إنشاء صفحة جديدة" : "Create First Page"}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick QR Code Modal */}
      {activeQrModalProfile && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/60 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center gap-5 text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveQrModalProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors text-lg"
              title={locale === "ar" ? "إغلاق" : "Close"}
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-1.5 mt-2">
              <FaQrcode className="text-primary w-8 h-8" />
              <h3 className="text-lg font-bold text-slate-100">
                {locale === "ar" ? "رمز الاستجابة السريعة (QR Code)" : "QR Code"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? `للصفحة: /${activeQrModalProfile.slug}` : `For page: /${activeQrModalProfile.slug}`}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center shrink-0">
              <QRCodeSVG
                id={`qr-svg-${activeQrModalProfile.slug}`}
                value={typeof window !== "undefined" ? `${window.location.origin}/${locale}/${activeQrModalProfile.slug}` : `/${locale}/${activeQrModalProfile.slug}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Clickable URL */}
            <div className="w-full">
              {(() => {
                const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/${locale}/${activeQrModalProfile.slug}` : `/${locale}/${activeQrModalProfile.slug}`;
                return (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 break-all"
                  >
                    <span className="truncate max-w-[240px]">{fullUrl}</span>
                    <FaExternalLinkAlt className="w-3 h-3 shrink-0" />
                  </a>
                );
              })()}
            </div>

            {/* Download Actions */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <Button
                type="button"
                onClick={() => downloadPNG(activeQrModalProfile.slug)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all"
              >
                {locale === "ar" ? "تحميل صورة PNG" : "Download PNG"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadSVG(activeQrModalProfile.slug)}
                className="w-full border-dashed border-primary/40 hover:border-primary/80 rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] transition-all"
              >
                {locale === "ar" ? "تحميل ملف SVG المتجه" : "Download Vector SVG"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

  // ----------------------------------------------------
  // EDITOR / CREATOR VIEW RENDERING
  // ----------------------------------------------------
  const isEditMode = view === "edit";

  // Build reactive profile state for Mobile Preview mockup
  const previewProfile: Partial<Profile> = !isEditMode
    ? {
        slug: newSlug,
        company_name_en: newCompanyNameEn,
        company_name_ar: newCompanyNameAr,
        company_address: newCompanyAddressAr || newCompanyAddressEn || null,
        company_address_en: newCompanyAddressEn,
        company_address_ar: newCompanyAddressAr,
        logo_url: newLogoPreview || null,
        background_image_url: newBgPreview || null,
        instapay_link: newInstapayLinks.filter(Boolean).map((l) => l.trim()).join(","),
        wallet_number: newWalletNumbers.filter(Boolean).map((w) => w.trim()).join(","),
        location: newLocation,
        theme: newTheme,
      }
    : editingProfile
      ? {
          ...editingProfile,
          logo_url: editLogoPreview || editingProfile.logo_url,
          background_image_url: editBgPreview || editingProfile.background_image_url,
          updated_at: editingProfile.updated_at,
        }
      : {};

  const previewLinks = isEditMode ? links : [];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate(() => setView("list"))}
          className="flex items-center gap-1.5"
        >
          <FaArrowLeft className="w-3.5 h-3.5" />
          <span>{locale === "ar" ? "العودة للقائمة" : "Back to List"}</span>
        </Button>

        <h2 className="text-lg font-bold">
          {isEditMode
            ? locale === "ar"
              ? `تعديل الصفحة: /${editingProfile?.slug}`
              : `Editing page: /${editingProfile?.slug}`
            : locale === "ar"
              ? "إنشاء صفحة جديدة"
              : "Create New Page"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!isEditMode ? (
            /* Creation Form */
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FaFolderPlus className="text-primary w-5 h-5" />
                  <span>
                    {locale === "ar"
                      ? "إنشاء صفحة هبوط جديدة"
                      : "Create New Slug Page"}
                  </span>
                </CardTitle>
                <CardDescription>
                  {locale === "ar"
                    ? "أدخل رابط التعريف والبيانات لإنشاء صفحة Linktree جديدة"
                    : "Set up a new identifier and details for a new landing page"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleCreateProfile}
                  className="flex flex-col gap-5"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="new_slug">{dict.admin.slug} *</Label>
                    <div className="flex gap-2 items-center">
                      <span className="text-muted-foreground text-sm font-mono bg-accent/50 p-2 rounded border">
                        /{locale}/
                      </span>
                      <Input
                        id="new_slug"
                        type="text"
                        required
                        placeholder="business-slug"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_company_name_en">
                      {locale === "ar"
                        ? "اسم الشركة (إنجليزي)"
                        : "Company Name (English)"}
                    </Label>
                    <Input
                      id="new_company_name_en"
                      type="text"
                      placeholder="My New Business"
                      value={newCompanyNameEn}
                      onChange={(e) => setNewCompanyNameEn(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_company_name_ar">
                      {locale === "ar"
                        ? "اسم الشركة (عربي)"
                        : "Company Name (Arabic)"}
                    </Label>
                    <Input
                      id="new_company_name_ar"
                      type="text"
                      placeholder="عملي الجديد"
                      value={newCompanyNameAr}
                      onChange={(e) => setNewCompanyNameAr(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_company_address_en">
                      {dict.admin.companyAddressEn}
                    </Label>
                    <Input
                      id="new_company_address_en"
                      type="text"
                      placeholder="Cairo, Egypt"
                      value={newCompanyAddressEn}
                      onChange={(e) => setNewCompanyAddressEn(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_company_address_ar">
                      {dict.admin.companyAddressAr}
                    </Label>
                    <Input
                      id="new_company_address_ar"
                      type="text"
                      placeholder="القاهرة، مصر"
                      value={newCompanyAddressAr}
                      onChange={(e) => setNewCompanyAddressAr(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_location">
                      {locale === "ar"
                        ? "رابط الخريطة / الموقع (Google Maps)"
                        : "Location URL (Google Maps)"}
                    </Label>
                    <Input
                      id="new_location"
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>{dict.admin.logoUrl}</Label>
                    {newLogoPreview ? (
                      <div className="flex items-center gap-4 p-3 bg-slate-900/5 dark:bg-slate-950/20 rounded-xl border border-border/40">
                        <img
                          src={newLogoPreview}
                          alt="Logo Preview"
                          className="w-16 h-16 rounded-full object-cover border border-border/60"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {newLogoFile?.name || "logo.webp"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {locale === "ar" ? "جاهز للرفع (webp)" : "Ready to upload (webp)"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setNewLogoFile(null)}
                        >
                          {locale === "ar" ? "إزالة" : "Remove"}
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/5 hover:bg-primary/5 transition-all relative min-h-[100px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewLogoFile(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FaUpload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs font-medium text-center">
                          {locale === "ar"
                            ? "اسحب وأفلت شعار الشركة هنا، أو انقر للاختيار"
                            : "Drag & drop company logo here, or click to browse"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {locale === "ar" ? "الحجم الأقصى 150 كيلوبايت" : "Max size 150KB"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label>{dict.admin.backgroundUrl}</Label>
                    {newBgPreview ? (
                      <div className="flex items-center gap-4 p-3 bg-slate-900/5 dark:bg-slate-950/20 rounded-xl border border-border/40">
                        <img
                          src={newBgPreview}
                          alt="Background Preview"
                          className="w-24 h-16 rounded-lg object-cover border border-border/60"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {newBgFile?.name || "background.webp"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {locale === "ar" ? "جاهز للرفع (webp)" : "Ready to upload (webp)"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setNewBgFile(null)}
                        >
                          {locale === "ar" ? "إزالة" : "Remove"}
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/5 hover:bg-primary/5 transition-all relative min-h-[100px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewBgFile(e.target.files[0]);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FaUpload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs font-medium text-center">
                          {locale === "ar"
                            ? "اسحب وأفلت صورة الخلفية هنا، أو انقر للاختيار"
                            : "Drag & drop background image here, or click to browse"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {locale === "ar" ? "الحجم الأقصى 400 كيلوبايت" : "Max size 400KB"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 border border-border/40 p-4 rounded-xl bg-slate-900/10 dark:bg-slate-950/20">
                    <Label>{dict.admin.instapayLink}</Label>
                    <div className="flex flex-col gap-2">
                      {newInstapayLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="url"
                            placeholder="https://instapay.eg/link/..."
                            value={link}
                            onChange={(e) => {
                              const updated = [...newInstapayLinks];
                              updated[idx] = e.target.value;
                              setNewInstapayLinks(updated);
                            }}
                          />
                          {newInstapayLinks.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = newInstapayLinks.filter((_, i) => i !== idx);
                                setNewInstapayLinks(updated);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50/10 shrink-0"
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewInstapayLinks([...newInstapayLinks, ""])}
                      className="w-fit text-xs flex items-center gap-1 border-dashed mt-1"
                    >
                      <FaPlus className="w-3 h-3" />
                      {locale === "ar" ? "إضافة رابط إنستا باي" : "Add Instapay Link"}
                    </Button>
                  </div>

                  <div className="grid gap-2 border border-border/40 p-4 rounded-xl bg-slate-900/10 dark:bg-slate-950/20">
                    <Label>{dict.admin.walletNumber}</Label>
                    <div className="flex flex-col gap-2">
                      {newWalletNumbers.map((wallet, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="tel"
                            placeholder="01234567890"
                            value={wallet}
                            onChange={(e) => {
                              const updated = [...newWalletNumbers];
                              updated[idx] = e.target.value;
                              setNewWalletNumbers(updated);
                            }}
                          />
                          {newWalletNumbers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updated = newWalletNumbers.filter((_, i) => i !== idx);
                                setNewWalletNumbers(updated);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50/10 shrink-0"
                            >
                              <FaTrash className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewWalletNumbers([...newWalletNumbers, ""])}
                      className="w-fit text-xs flex items-center gap-1 border-dashed mt-1"
                    >
                      <FaPlus className="w-3 h-3" />
                      {locale === "ar" ? "إضافة محفظة إلكترونية" : "Add Electronic Wallet"}
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new_theme">
                      {locale === "ar" ? "اختر السمة (Theme)" : "Select Theme"}
                    </Label>
                    <select
                      id="new_theme"
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus-visible:outline-none"
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                    >
                      {THEMES.map((t) => (
                        <option key={t.key} value={t.key} className="bg-background text-slate-100">
                          {locale === "ar" ? t.nameAr : t.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {createError && (
                    <p className="text-sm p-3 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg">
                      {createError}
                    </p>
                  )}

                  <div className="flex gap-4 pt-2">
                    <Button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {createLoading ? (
                        <FaSpinner className="animate-spin w-4 h-4" />
                      ) : (
                        <FaCheck className="w-4 h-4" />
                      )}
                      <span>
                        {locale === "ar" ? "إنشاء الصفحة" : "Create Page"}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleNavigate(() => setView("list"))}
                    >
                      {locale === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Editing Panels */
            editingProfile && (
              <div className="flex flex-col gap-6">
                {/* Profile Details Card */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FaUser className="text-primary w-5 h-5" />
                      <span>{dict.admin.profileSettings}</span>
                    </CardTitle>
                    <CardDescription>
                      {locale === "ar"
                        ? "تعديل البيانات الأساسية لصفحة الهبوط"
                        : "Edit core details of your landing page"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleUpdateProfile}
                      className="flex flex-col gap-5"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="edit_slug">{dict.admin.slug} *</Label>
                        <div className="flex gap-2 items-center">
                          <span className="text-muted-foreground text-sm font-mono bg-accent/50 p-2 rounded border">
                            /{locale}/
                          </span>
                          <Input
                            id="edit_slug"
                            type="text"
                            required
                            value={editingProfile.slug}
                            onChange={(e) =>
                              setEditingProfile({
                                ...editingProfile,
                                slug: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_company_name_en">
                          {locale === "ar"
                            ? "اسم الشركة (إنجليزي)"
                            : "Company Name (English)"}
                        </Label>
                        <Input
                          id="edit_company_name_en"
                          type="text"
                          required
                          value={editingProfile.company_name_en || ""}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              company_name_en: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_company_name_ar">
                          {locale === "ar"
                            ? "اسم الشركة (عربي)"
                            : "Company Name (Arabic)"}
                        </Label>
                        <Input
                          id="edit_company_name_ar"
                          type="text"
                          required
                          value={editingProfile.company_name_ar || ""}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              company_name_ar: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_company_address_en">
                          {dict.admin.companyAddressEn}
                        </Label>
                        <Input
                          id="edit_company_address_en"
                          type="text"
                          value={editingProfile.company_address_en || ""}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              company_address_en: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_company_address_ar">
                          {dict.admin.companyAddressAr}
                        </Label>
                        <Input
                          id="edit_company_address_ar"
                          type="text"
                          value={editingProfile.company_address_ar || ""}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              company_address_ar: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_location">
                          {locale === "ar"
                            ? "رابط الخريطة / الموقع (Google Maps)"
                            : "Location URL (Google Maps)"}
                        </Label>
                        <Input
                          id="edit_location"
                          type="url"
                          value={editingProfile.location || ""}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>{dict.admin.logoUrl}</Label>
                        {editLogoPreview || editingProfile.logo_url ? (
                          <div className="flex items-center gap-4 p-3 bg-slate-900/5 dark:bg-slate-950/20 rounded-xl border border-border/40">
                            <img
                              src={getBustUrl(editLogoPreview || editingProfile.logo_url, editingProfile.updated_at)}
                              alt="Logo Preview"
                              className="w-16 h-16 rounded-full object-cover border border-border/60"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {editLogoFile ? editLogoFile.name : (locale === "ar" ? "الشعار الحالي" : "Current Logo")}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {editLogoFile 
                                  ? (locale === "ar" ? "جاهز للرفع (webp)" : "Ready to upload (webp)")
                                  : (locale === "ar" ? "صورة مرفوعة مسبقاً" : "Previously uploaded image")}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setEditLogoFile(null);
                                setEditingProfile({
                                  ...editingProfile,
                                  logo_url: null,
                                });
                              }}
                            >
                              {locale === "ar" ? "إزالة" : "Remove"}
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/5 hover:bg-primary/5 transition-all relative min-h-[100px]">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setEditLogoFile(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <FaUpload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs font-medium text-center">
                              {locale === "ar"
                                ? "اسحب وأفلت شعار الشركة هنا، أو انقر للاختيار"
                                : "Drag & drop company logo here, or click to browse"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {locale === "ar" ? "الحجم الأقصى 150 كيلوبايت" : "Max size 150KB"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label>{dict.admin.backgroundUrl}</Label>
                        {editBgPreview || editingProfile.background_image_url ? (
                          <div className="flex items-center gap-4 p-3 bg-slate-900/5 dark:bg-slate-950/20 rounded-xl border border-border/40">
                            <img
                              src={getBustUrl(editBgPreview || editingProfile.background_image_url, editingProfile.updated_at)}
                              alt="Background Preview"
                              className="w-24 h-16 rounded-lg object-cover border border-border/60"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate">
                                {editBgFile ? editBgFile.name : (locale === "ar" ? "صورة الخلفية الحالية" : "Current Background")}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {editBgFile 
                                  ? (locale === "ar" ? "جاهز للرفع (webp)" : "Ready to upload (webp)")
                                  : (locale === "ar" ? "صورة مرفوعة مسبقاً" : "Previously uploaded image")}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setEditBgFile(null);
                                setEditingProfile({
                                  ...editingProfile,
                                  background_image_url: null,
                                });
                              }}
                            >
                              {locale === "ar" ? "إزالة" : "Remove"}
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-900/5 hover:bg-primary/5 transition-all relative min-h-[100px]">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setEditBgFile(e.target.files[0]);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <FaUpload className="w-6 h-6 text-muted-foreground" />
                            <span className="text-xs font-medium text-center">
                              {locale === "ar"
                                ? "اسحب وأفلت صورة الخلفية هنا، أو انقر للاختيار"
                                : "Drag & drop background image here, or click to browse"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {locale === "ar" ? "الحجم الأقصى 400 كيلوبايت" : "Max size 400KB"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-2 border border-border/40 p-4 rounded-xl bg-slate-900/10 dark:bg-slate-950/20">
                        <Label>{dict.admin.instapayLink}</Label>
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const links = editingProfile.instapay_link
                              ? editingProfile.instapay_link.split(",").map((l) => l.trim())
                              : [""];
                            return (
                              <>
                                {links.map((link, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Input
                                      type="url"
                                      placeholder="https://instapay.eg/link/..."
                                      value={link}
                                      onChange={(e) => {
                                        const updated = [...links];
                                        updated[idx] = e.target.value;
                                        setEditingProfile({
                                          ...editingProfile,
                                          instapay_link: updated.join(",")
                                        });
                                      }}
                                    />
                                    {(links.length > 1 || links[0] !== "") && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const updated = links.filter((_, i) => i !== idx);
                                          setEditingProfile({
                                            ...editingProfile,
                                            instapay_link: updated.join(",") || null
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50/10 shrink-0"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...links, ""];
                                    setEditingProfile({
                                      ...editingProfile,
                                      instapay_link: updated.join(",")
                                    });
                                  }}
                                  className="w-fit text-xs flex items-center gap-1 border-dashed mt-1"
                                >
                                  <FaPlus className="w-3 h-3" />
                                  {locale === "ar" ? "إضافة رابط إنستا باي" : "Add Instapay Link"}
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid gap-2 border border-border/40 p-4 rounded-xl bg-slate-900/10 dark:bg-slate-950/20">
                        <Label>{dict.admin.walletNumber}</Label>
                        <div className="flex flex-col gap-2">
                          {(() => {
                            const wallets = editingProfile.wallet_number
                              ? editingProfile.wallet_number.split(",").map((w) => w.trim())
                              : [""];
                            return (
                              <>
                                {wallets.map((wallet, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <Input
                                      type="tel"
                                      placeholder="01234567890"
                                      value={wallet}
                                      onChange={(e) => {
                                        const updated = [...wallets];
                                        updated[idx] = e.target.value;
                                        setEditingProfile({
                                          ...editingProfile,
                                          wallet_number: updated.join(",")
                                        });
                                      }}
                                    />
                                    {(wallets.length > 1 || wallets[0] !== "") && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const updated = wallets.filter((_, i) => i !== idx);
                                          setEditingProfile({
                                            ...editingProfile,
                                            wallet_number: updated.join(",") || null
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50/10 shrink-0"
                                      >
                                        <FaTrash className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updated = [...wallets, ""];
                                    setEditingProfile({
                                      ...editingProfile,
                                      wallet_number: updated.join(",")
                                    });
                                  }}
                                  className="w-fit text-xs flex items-center gap-1 border-dashed mt-1"
                                >
                                  <FaPlus className="w-3 h-3" />
                                  {locale === "ar" ? "إضافة محفظة إلكترونية" : "Add Electronic Wallet"}
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="edit_theme">
                          {locale === "ar" ? "اختر السمة (Theme)" : "Select Theme"}
                        </Label>
                        <select
                          id="edit_theme"
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background text-slate-100 px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus-visible:outline-none"
                          value={editingProfile.theme || "theme1"}
                          onChange={(e) =>
                            setEditingProfile({
                              ...editingProfile,
                              theme: e.target.value,
                            })
                          }
                        >
                          {THEMES.map((t) => (
                            <option key={t.key} value={t.key} className="bg-background text-slate-100">
                              {locale === "ar" ? t.nameAr : t.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      {profileMessage && (
                        <p
                          className={cn(
                            "text-sm p-3 rounded-lg border",
                            profileMessage.type === "success"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
                          )}
                        >
                          {profileMessage.text}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={profileLoading}
                        className="flex items-center justify-center gap-2"
                      >
                        {profileLoading ? (
                          <FaSpinner className="animate-spin w-4 h-4" />
                        ) : (
                          <FaCheck className="w-4 h-4" />
                        )}
                        <span>{dict.admin.saveProfile}</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Manage Links Card */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FaLink className="text-primary w-5 h-5" />
                      <span>{dict.admin.manageLinks}</span>
                    </CardTitle>
                    <CardDescription>
                      {locale === "ar"
                        ? "إضافة أو تعديل الروابط لهذه الصفحة"
                        : "Manage links specific to this profile"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6">
                    {/* Add Link Form */}
                    <form
                      onSubmit={handleSaveLink}
                      className="p-4 rounded-xl border border-border/80 bg-accent/20 flex flex-col gap-4 text-left rtl:text-right"
                    >
                      <div className="grid gap-2">
                        <Label htmlFor="platform_name">
                          {locale === "ar" ? "اختر المنصة" : "Select Platform"}
                        </Label>
                        <select
                          id="platform_name"
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={newLinkPlatform}
                          onChange={(e) => setNewLinkPlatform(e.target.value)}
                        >
                          <option
                            value=""
                            className="bg-background text-foreground"
                          >
                            --{" "}
                            {locale === "ar"
                              ? "اختر المنصة"
                              : "Select Platform"}{" "}
                            --
                          </option>
                          {PLATFORMS.map((p) => (
                            <option
                              key={p.key}
                              value={p.key}
                              className="bg-background text-foreground"
                            >
                              {locale === "ar" ? p.ar : p.en}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="link_url">
                          {newLinkPlatform === "mobile_call"
                            ? (locale === "ar" ? "رقم الموبايل" : "Mobile Number")
                            : newLinkPlatform === "whatsapp"
                            ? (locale === "ar" ? "رقم الواتساب" : "WhatsApp Number")
                            : dict.admin.url}
                        </Label>
                        <Input
                          id="link_url"
                          type={
                            (newLinkPlatform === "mobile_call" || newLinkPlatform === "whatsapp")
                              ? "tel"
                              : "url"
                          }
                          required
                          placeholder={
                            (newLinkPlatform === "mobile_call" || newLinkPlatform === "whatsapp")
                              ? "01xxxxxxxxx"
                              : "https://example.com"
                          }
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 select-none">
                        <Checkbox
                          id="link_active"
                          checked={newLinkActive}
                          onCheckedChange={(checked) =>
                            setNewLinkActive(!!checked)
                          }
                        />
                        <Label htmlFor="link_active" className="cursor-pointer">
                          {dict.admin.active}
                        </Label>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={linksLoading}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          {linksLoading ? (
                            <FaSpinner className="animate-spin w-3.5 h-3.5" />
                          ) : editingLinkId ? (
                            <FaCheck className="w-3.5 h-3.5" />
                          ) : (
                            <FaPlus className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {editingLinkId
                              ? (locale === "ar" ? "حفظ التعديلات" : "Save Changes")
                              : dict.admin.addLink}
                          </span>
                        </Button>
                        {editingLinkId && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingLinkId(null);
                              setNewLinkPlatform("");
                              setNewLinkUrl("");
                              setNewLinkActive(true);
                            }}
                          >
                            {locale === "ar" ? "إلغاء" : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </form>

                    {/* Links List */}
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                      <h3 className="font-semibold text-sm border-b pb-1.5 text-left rtl:text-right">
                        {dict.admin.manageLinks}
                      </h3>
                      {linksFetchLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <FaSpinner className="animate-spin w-5 h-5 text-muted-foreground" />
                        </div>
                      ) : links.length > 0 ? (
                        links.map((link, index) => {
                          const platform = getPlatformConfig(
                            link.platform_name,
                          );
                          const platformDisplayName = platform
                            ? locale === "ar"
                              ? platform.ar
                              : platform.en
                            : link.platform_name;
                          const iconName = platform
                            ? platform.iconName
                            : "FaGlobe";

                          return (
                            <div
                              key={link.id}
                              className="flex justify-between items-center p-3 rounded-lg border bg-card/50 hover:bg-card transition"
                            >
                              <div className="flex items-center gap-3 overflow-hidden max-w-[220px]">
                                {/* Reorder Arrows */}
                                <div className="flex flex-col gap-0.5">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-slate-500 hover:text-white"
                                    disabled={index === 0}
                                    onClick={() => handleMoveLink(index, "up")}
                                  >
                                    <FaArrowUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-slate-500 hover:text-white"
                                    disabled={index === links.length - 1}
                                    onClick={() =>
                                      handleMoveLink(index, "down")
                                    }
                                  >
                                    <FaArrowDown className="w-3 h-3" />
                                  </Button>
                                </div>

                                {/* Platform Icon */}
                                <div className="p-2 rounded bg-slate-800 text-slate-300">
                                  <PlatformIcon
                                    name={iconName}
                                    className="w-4 h-4"
                                  />
                                </div>

                                <div className="flex flex-col gap-0.5 select-none overflow-hidden text-left rtl:text-right">
                                  <span className="font-bold text-sm truncate">
                                    {platformDisplayName}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate font-mono max-w-[120px]">
                                    {link.url}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`active_${link.id}`}
                                    checked={link.is_active}
                                    onCheckedChange={() =>
                                      handleToggleLinkActive(
                                        link.id,
                                        link.is_active,
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`active_${link.id}`}
                                    className="text-[10px] cursor-pointer select-none"
                                  >
                                    {link.is_active
                                      ? dict.admin.active
                                      : dict.admin.inactive}
                                  </Label>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-white hover:bg-slate-800 h-7 w-7"
                                  onClick={() => {
                                    setEditingLinkId(link.id);
                                    setNewLinkPlatform(link.platform_name);
                                    setNewLinkUrl(link.url);
                                    setNewLinkActive(link.is_active);
                                  }}
                                  title={locale === "ar" ? "تعديل الرابط" : "Edit Link"}
                                >
                                  <FaPen className="w-3 h-3" />
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-7 w-7"
                                  onClick={() => handleDeleteLink(link.id)}
                                >
                                  <FaTrash className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          {dict.common.noLinks}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* QR Code Generation Card */}
                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FaQrcode className="text-primary w-5 h-5" />
                      <span>{locale === "ar" ? "رمز الاستجابة السريعة (QR Code)" : "QR Code"}</span>
                    </CardTitle>
                    <CardDescription>
                      {locale === "ar"
                        ? "تحميل رمز الـ QR الخاص بصفحتك بجودة فائقة للطباعة أو الاستخدام الرقمي"
                        : "Download your page's QR code in high-resolution for printing or digital sharing"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
                      {/* Left: The QR code itself */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md shrink-0 flex items-center justify-center">
                        <QRCodeSVG
                          id={`qr-svg-${editingProfile.slug}`}
                          value={typeof window !== "undefined" ? `${window.location.origin}/${locale}/${editingProfile.slug}` : `/${locale}/${editingProfile.slug}`}
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      {/* Right: URL and download options */}
                      <div className="flex-1 flex flex-col gap-4 w-full text-center md:text-left rtl:md:text-right">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {locale === "ar" ? "رابط الصفحة المباشر" : "Direct Page Link"}
                          </span>
                          {(() => {
                            const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/${locale}/${editingProfile.slug}` : `/${locale}/${editingProfile.slug}`;
                            return (
                              <a
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-primary hover:underline flex items-center justify-center md:justify-start gap-1.5 break-all"
                              >
                                <span className="truncate max-w-[280px]">{fullUrl}</span>
                                <FaExternalLinkAlt className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            );
                          })()}
                        </div>

                        <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                          <Button
                            type="button"
                            onClick={() => downloadPNG(editingProfile.slug)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-all"
                          >
                            {locale === "ar" ? "تحميل صورة PNG" : "Download PNG"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => downloadSVG(editingProfile.slug)}
                            className="border-dashed border-primary/40 hover:border-primary/80 rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-all"
                          >
                            {locale === "ar" ? "تحميل ملف SVG المتجه" : "Download Vector SVG"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </div>

        {/* Right Preview Column (Sticky) */}
        <div className="lg:col-span-4 sticky top-24 hidden lg:flex flex-col items-center gap-4">
          <div className="font-semibold text-xs text-slate-400 tracking-wider uppercase select-none">
            {locale === "ar" ? "معاينة حية للموبايل" : "Live Mobile Preview"}
          </div>
          <MobilePreview
            profile={previewProfile}
            links={previewLinks}
            locale={locale}
          />
        </div>
      </div>
      {/* Quick QR Code Modal */}
      {activeQrModalProfile && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/60 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center gap-5 text-center shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setActiveQrModalProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors text-lg"
              title={locale === "ar" ? "إغلاق" : "Close"}
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-1.5 mt-2">
              <FaQrcode className="text-primary w-8 h-8" />
              <h3 className="text-lg font-bold text-slate-100">
                {locale === "ar" ? "رمز الاستجابة السريعة (QR Code)" : "QR Code"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? `للصفحة: /${activeQrModalProfile.slug}` : `For page: /${activeQrModalProfile.slug}`}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center shrink-0">
              <QRCodeSVG
                id={`qr-svg-${activeQrModalProfile.slug}`}
                value={typeof window !== "undefined" ? `${window.location.origin}/${locale}/${activeQrModalProfile.slug}` : `/${locale}/${activeQrModalProfile.slug}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Clickable URL */}
            <div className="w-full">
              {(() => {
                const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/${locale}/${activeQrModalProfile.slug}` : `/${locale}/${activeQrModalProfile.slug}`;
                return (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1 break-all"
                  >
                    <span className="truncate max-w-[240px]">{fullUrl}</span>
                    <FaExternalLinkAlt className="w-3 h-3 shrink-0" />
                  </a>
                );
              })()}
            </div>

            {/* Download Actions */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <Button
                type="button"
                onClick={() => downloadPNG(activeQrModalProfile.slug)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] transition-all"
              >
                {locale === "ar" ? "تحميل صورة PNG" : "Download PNG"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadSVG(activeQrModalProfile.slug)}
                className="w-full border-dashed border-primary/40 hover:border-primary/80 rounded-xl py-2 text-xs flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.02] transition-all"
              >
                {locale === "ar" ? "تحميل ملف SVG المتجه" : "Download Vector SVG"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
