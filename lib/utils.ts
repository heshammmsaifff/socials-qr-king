import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBustUrl(url: string | null | undefined, updatedAt?: string) {
  if (!url) return undefined;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  const isSupabase = url.includes("supabase.co");
  const isExternal = url.startsWith("http://") || url.startsWith("https://");

  if (isExternal && !isSupabase) {
    // Route external URLs through our proxy to bypass CORS and signature corruption
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }

  // For Supabase or local URLs, append the cache buster safely
  const cacheBuster = updatedAt ? new Date(updatedAt).getTime() : "";
  if (!cacheBuster) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${cacheBuster}`;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
