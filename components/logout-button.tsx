"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export function LogoutButton({ locale }: { locale: string }) {
  const router = useRouter();
  const dict = getDictionary(locale as Locale);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push(`/${locale}/auth/login`);
  };

  return (
    <Button onClick={logout} variant="outline" size="sm">
      {dict.common.logout}
    </Button>
  );
}
