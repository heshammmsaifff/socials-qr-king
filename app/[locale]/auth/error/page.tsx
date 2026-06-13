import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { getDictionary, type Locale } from "@/lib/dictionaries";

type Params = Promise<{ locale: string }>;

async function ErrorContent({
  searchParams,
  locale,
}: {
  searchParams: Promise<{ error: string }>;
  locale: string;
}) {
  const params = await searchParams;
  const dict = getDictionary(locale as Locale);

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          {dict.common.error}: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ error: string }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale as Locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>{dict.common.loading}</div>}>
                <ErrorContent searchParams={searchParams} locale={locale} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
