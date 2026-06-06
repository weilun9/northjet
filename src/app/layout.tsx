import type { Metadata } from 'next';
import { Sora, DM_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NorthJet – Premium Private Jet Travel from Dairy Flat',
    template: '%s | NorthJet',
  },
  description:
    'Experience exclusive private jet travel with NorthJet. Fly from Dairy Flat Airport to Sydney, Rotorua, Great Barrier Island, Chatham Islands, and Lake Tekapo.',
  keywords: ['private jet', 'NorthJet', 'Dairy Flat', 'Auckland', 'luxury air travel', 'New Zealand'],
  openGraph: {
    title: 'NorthJet – Premium Private Jet Travel',
    description: 'Luxury private jet services from Dairy Flat Airport, Auckland.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
