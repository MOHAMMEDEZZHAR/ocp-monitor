import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
 
export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
 
  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
