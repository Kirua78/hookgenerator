import { Inter } from 'next/font/google';
import './globals.css';
import ConstellationBackground from './components/ConstellationBackground';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://hookgenerator.eu'),
  title: {
    default: 'HookGenerator — Hooks viraux pour TikTok, Instagram, YouTube',
    template: '%s | HookGenerator',
  },
  description: "L'outil qui génère des hooks viraux en quelques secondes pour TikTok, Instagram Reels, YouTube Shorts et LinkedIn. Stop à la page blanche.",
  keywords: ['hook viral', 'hook tiktok', 'accroche vidéo', 'créateur de contenu', 'hook instagram', 'hook youtube', 'generateur hook'],
  authors: [{ name: 'HookGenerator', url: 'https://hookgenerator.eu' }],
  creator: 'HookGenerator',
  publisher: 'SB SOLUTION INFO',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://hookgenerator.eu',
    siteName: 'HookGenerator',
    title: 'HookGenerator — Hooks viraux pour TikTok, Instagram, YouTube',
    description: "L'outil qui génère des hooks viraux en quelques secondes. Stop à la page blanche. Start au scroll.",
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HookGenerator — Génère des hooks viraux' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HookGenerator — Hooks viraux pour TikTok, Instagram, YouTube',
    description: "L'outil qui génère des hooks viraux en quelques secondes. Stop à la page blanche.",
    images: ['/og-image.png'],
    creator: '@hookgenerator',
  },
  alternates: { canonical: 'https://hookgenerator.eu' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className} style={{ background: '#0a0a0f', minHeight: '100vh' }}>
        <ConstellationBackground />
        {children}
      </body>
    </html>
  );
}