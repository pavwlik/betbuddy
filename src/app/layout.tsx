import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'BetBuddy',
  description: 'Predikce a sázky mezi kamarády',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="min-h-screen bg-base text-white font-mono antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
