// app/opengraph-image.js
// Next.js génère automatiquement /og-image.png depuis ce fichier
// Nécessite @vercel/og (déjà inclus dans Next.js 13+)

import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'HookGenerator — Hooks viraux pour créateurs de contenu';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Fond grille simulé */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(124,77,255,0.15) 0%, transparent 70%)',
        }} />

        {/* Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid rgba(224,64,251,0.4)',
          borderRadius: '99px',
          padding: '8px 24px',
          fontSize: 18,
          fontWeight: 700,
          color: '#e040fb',
          marginBottom: 40,
        }}>
          50 000+ hooks générés ce mois
        </div>

        {/* Titre */}
        <div style={{
          fontSize: 72,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: 24,
          maxWidth: 900,
        }}>
          Tes vidéos méritent un{' '}
          <span style={{ color: '#e040fb' }}>hook qui déchire</span>
        </div>

        {/* Sous-titre */}
        <div style={{
          fontSize: 26,
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          maxWidth: 700,
          marginBottom: 48,
        }}>
          TikTok · Instagram · YouTube · LinkedIn
        </div>

        {/* URL */}
        <div style={{
          fontSize: 20,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.05em',
        }}>
          hookgenerator.eu
        </div>
      </div>
    ),
    { ...size }
  );
}
