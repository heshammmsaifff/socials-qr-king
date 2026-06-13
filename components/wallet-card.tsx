"use client";

import { FaMobileAlt } from "react-icons/fa";
import { FaCopy } from "react-icons/fa6";

interface WalletCardProps {
  wallet: string;
  label: string;
  theme: {
    textColor: string;
    subTextColor: string;
    primaryColor: string;
    payWalletBg: string;
    payWalletBorder: string;
    payWalletIconBg: string;
    payWalletIconText: string;
  };
  locale: string;
}

export function WalletCard({ wallet, label, theme, locale }: WalletCardProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wallet);
      const Swal = (await import("sweetalert2")).default;
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
        background: "rgb(15 23 42)",
        color: "#f8fafc",
        customClass: {
          popup: "rounded-xl border border-slate-700/60 shadow-lg text-xs"
        }
      });
      Toast.fire({
        icon: "success",
        title: locale === "ar" ? "تم نسخ الرقم بنجاح" : "Wallet number copied",
      });
    } catch (err) {
      console.error("Failed to copy wallet number:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`group w-full flex items-center justify-between p-3 rounded-xl border text-left rtl:text-right transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${theme.payWalletBg} ${theme.payWalletBorder} hover:border-current/30`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded shrink-0 ${theme.payWalletIconBg} ${theme.payWalletIconText}`}>
          <FaMobileAlt className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left rtl:text-right">
          <span className={`font-bold text-sm ${theme.textColor}`}>
            {label}
          </span>
          <span className={`text-xs font-mono ${theme.subTextColor}`}>
            {wallet}
          </span>
        </div>
      </div>
      <FaCopy className={`w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ${theme.primaryColor}`} />
    </button>
  );
}
