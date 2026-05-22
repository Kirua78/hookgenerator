export default function Mentions() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-xs text-gray-500 hover:text-pink-400 transition mb-6 inline-block">← Retour</a>
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Mentions Légales</h1>
        <p className="text-gray-500 text-sm mb-8">Conformément à la loi n° 2004-575 du 21 juin 2004</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-3">Éditeur du site</h2>
            <div className="space-y-1 text-gray-400">
              <p><strong className="text-white">Société :</strong> SB SOLUTION INFO</p>
              <p><strong className="text-white">Siège social :</strong> Carrières-sous-Poissy, 78955, France</p>
              <p><strong className="text-white">Email :</strong> <a href="mailto:contact@hookgenerator.eu" className="text-pink-400 hover:underline">contact@hookgenerator.eu</a></p>
              <p><strong className="text-white">Site web :</strong> hookgenerator.eu</p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Hébergement</h2>
            <div className="space-y-1 text-gray-400">
              <p><strong className="text-white">Hébergeur :</strong> Vercel Inc.</p>
              <p><strong className="text-white">Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, USA</p>
              <p><strong className="text-white">Site :</strong> <a href="https://vercel.com" className="text-pink-400 hover:underline" target="_blank">vercel.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Propriété intellectuelle</h2>
            <p>L'ensemble des contenus présents sur hookgenerator.eu (textes, images, logos, interface) est la propriété exclusive de SB SOLUTION INFO, protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction est interdite sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Données personnelles</h2>
            <p>Le traitement des données personnelles est décrit dans notre <a href="/privacy" className="text-pink-400 hover:underline">Politique de Confidentialité</a>. Conformément au RGPD, vous pouvez exercer vos droits en contactant : <a href="mailto:contact@hookgenerator.eu" className="text-pink-400 hover:underline">contact@hookgenerator.eu</a></p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">Droit applicable</h2>
            <p>Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </section>
        </div>
      </div>
    </main>
  );
}