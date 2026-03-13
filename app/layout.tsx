import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import PWARegister from '@/components/PWARegister';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#1b4965',
};

export const metadata: Metadata = {
  title: 'ShoreStack Vault',
  description: 'Zero-knowledge encrypted password manager and secure document storage.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vault',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style>{`
          :root {
            --font-sans: ${inter.style.fontFamily};
            --font-mono: ${jetbrainsMono.style.fontFamily};
          }
        `}</style>
      </head>
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-sand text-deep-ocean`}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
