import './globals.css';
import type { Metadata } from 'next';
import { Noto_Naskh_Arabic } from 'next/font/google';
import { PwaRegister } from '@/components/pwa-register';

const naskh = Noto_Naskh_Arabic({ subsets: ['arabic', 'latin'], variable: '--font-naskh', display: 'swap' });

export const metadata: Metadata = {
  title: 'Neteweya Torê',
  description: 'The digital homeland of the Kurds: identity, messaging and language without borders.',
  manifest: '/manifest.webmanifest',
  themeColor: '#070b14',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'Torê',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ku">
      <body className={`${naskh.variable} min-h-screen bg-ink font-sans text-slate-100 antialiased pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
