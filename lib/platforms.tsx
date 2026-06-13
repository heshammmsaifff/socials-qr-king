import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaSnapchat,
  FaWhatsapp,
  FaPhone,
  FaBriefcase,
  FaGlobe,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa6";

export type PlatformKey =
  | "facebook_page"
  | "facebook_profile"
  | "facebook_group"
  | "instagram"
  | "tiktok"
  | "snapchat"
  | "whatsapp"
  | "mobile_call"
  | "portfolio"
  | "github"
  | "linkedin"
  | "website";

export interface PlatformConfig {
  key: PlatformKey;
  iconName: string;
  en: string;
  ar: string;
}

export const PLATFORMS: PlatformConfig[] = [
  {
    key: "facebook_page",
    iconName: "FaFacebook",
    en: "Facebook Page",
    ar: "صفحة فيسبوك",
  },
  {
    key: "facebook_profile",
    iconName: "FaFacebook",
    en: "Facebook Profile",
    ar: "بروفايل فيسبوك",
  },
  {
    key: "facebook_group",
    iconName: "FaFacebook",
    en: "Facebook Group",
    ar: "جروب فيسبوك",
  },
  {
    key: "instagram",
    iconName: "FaInstagram",
    en: "Instagram",
    ar: "انستجرام",
  },
  {
    key: "tiktok",
    iconName: "FaTiktok",
    en: "TikTok",
    ar: "تيك توك",
  },
  {
    key: "snapchat",
    iconName: "FaSnapchat",
    en: "Snapchat",
    ar: "سناب شات",
  },
  {
    key: "whatsapp",
    iconName: "FaWhatsapp",
    en: "WhatsApp",
    ar: "واتساب",
  },
  {
    key: "mobile_call",
    iconName: "FaPhone",
    en: "Mobile (Call)",
    ar: "رقم الموبايل (اتصال)",
  },
  {
    key: "portfolio",
    iconName: "FaBriefcase",
    en: "Portfolio",
    ar: "بورتفوليو",
  },
  {
    key: "github",
    iconName: "FaGithub",
    en: "GitHub",
    ar: "جيت هاب",
  },
  {
    key: "linkedin",
    iconName: "FaLinkedin",
    en: "LinkedIn",
    ar: "لينكد إن",
  },
  {
    key: "website",
    iconName: "FaGlobe",
    en: "Website",
    ar: "الموقع الإلكتروني",
  },
];

export function PlatformIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "FaFacebook":
      return <FaFacebook className={className} />;
    case "FaInstagram":
      return <FaInstagram className={className} />;
    case "FaTiktok":
      return <FaTiktok className={className} />;
    case "FaSnapchat":
      return <FaSnapchat className={className} />;
    case "FaWhatsapp":
      return <FaWhatsapp className={className} />;
    case "FaPhone":
      return <FaPhone className={className} />;
    case "FaBriefcase":
      return <FaBriefcase className={className} />;
    case "FaGithub":
      return <FaGithub className={className} />;
    case "FaLinkedin":
      return <FaLinkedin className={className} />;
    default:
      return <FaGlobe className={className} />;
  }
}

export function getPlatformConfig(platformName: string): PlatformConfig | undefined {
  return PLATFORMS.find(p => p.key === platformName || p.en === platformName || p.ar === platformName);
}
