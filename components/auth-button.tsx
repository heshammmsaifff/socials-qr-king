import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getDictionary, type Locale } from "@/lib/dictionaries";

export async function AuthButton({ locale }: { locale: string }) {
  const hasEnv =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!hasEnv) {
    return null;
  }

  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const dict = getDictionary(locale as Locale);

  return user ? (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-muted-foreground">
        {user.email}
      </span>
      <LogoutButton locale={locale} />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href={`/${locale}/auth/login`}>{dict.common.signIn}</Link>
      </Button>
    </div>
  );
}
