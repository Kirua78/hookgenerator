export const metadata = {
  title: 'Tarifs — HookGenerator',
  description: 'Découvre nos offres : gratuit, mensuel 4,99€, annuel 39,99€ ou packs de hooks.',
  alternates: { canonical: 'https://hookgenerator.eu/pricing' },
  openGraph: {
    title: 'Tarifs HookGenerator — À partir de 4,99€/mois',
    description: 'Offre mensuelle, annuelle ou packs one-shot.',
    url: 'https://hookgenerator.eu/pricing',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function PricingLayout({ children }) {
  return children;
}