import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from '@/components/providers';
import { StickyFooter } from '@/components/sticky-footer';

import '@/index.css';
import { CITIES, getCity, getLocale, LOCALES } from '@/lib/navigation/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateStaticParams() {
  const staticParams = [];

  for (const locales in LOCALES) {
    for (const city in CITIES) {
      staticParams.push({ locale: locales, city: city });
    }
  }

  return staticParams;
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]/[city]'>): Promise<Metadata> {
  const { city, locale } = await params;

  const cityData = getCity(city);
  const localeData = getLocale(locale);

  if (!cityData || !localeData) {
    return {
      title: {
        default: 'YayaGO - Car Rental Marketplace',
        template: '%s | YayaGO - Car Rental Marketplace',
      },
      description: 'The Car Rental Marketplace application for YayaGO',
    };
  }

  return {
    title: {
      default: `YayaGO - Car Rental Marketplace in ${cityData.names[locale as keyof typeof cityData.names]}`,
      template: `%s | YayaGO - Car Rental Marketplace in ${cityData.names[locale as keyof typeof cityData.names]}`,
    },
    description: `The Car Rental Marketplace application for YayaGO in ${cityData.names[locale as keyof typeof cityData.names]}`,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]/[city]'>) {
  const { locale } = await params;

  const localeData = getLocale(locale);

  return (
    <html lang={locale} dir={localeData.dir} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <StickyFooter />
        </Providers>
      </body>
    </html>
  );
}
