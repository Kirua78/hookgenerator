export default function CGU() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-xs text-gray-500 hover:text-pink-400 transition mb-6 inline-block">← Retour</a>
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : mai 2025</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Présentation du service</h2>
            <p>HookGenerator est un service en ligne édité par SB SOLUTION INFO, dont le siège social est situé à Carrières-sous-Poissy (78955), France. Le service est accessible à l'adresse hookgenerator.eu et permet aux utilisateurs de générer des hooks viraux, des légendes, des idées de vidéos et d'analyser leurs accroches pour les réseaux sociaux.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Acceptation des conditions</h2>
            <p>L'utilisation du service HookGenerator implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Accès au service</h2>
            <p className="mb-2">Le service est accessible :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Gratuitement pour 3 générations par jour sans inscription</li>
              <li>Via un abonnement mensuel (4,99€/mois) ou annuel (39,99€/an) pour un accès illimité</li>
              <li>Via des packs one-shot : 200 hooks (6,99€) ou 500 hooks (9,99€)</li>
            </ul>
            <p className="mt-2">SB SOLUTION INFO se réserve le droit de modifier les conditions d'accès à tout moment.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Création de compte</h2>
            <p>Pour accéder aux fonctionnalités complètes, l'utilisateur doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Tout accès au service via son compte est réputé effectué par l'utilisateur.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Paiement et abonnements</h2>
            <p className="mb-2">Les paiements sont traités par Stripe, prestataire de paiement sécurisé. En souscrivant à un abonnement :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>L'abonnement est renouvelé automatiquement à chaque période</li>
              <li>La résiliation peut être effectuée à tout moment depuis votre espace client</li>
              <li>Les packs one-shot sont valables jusqu'à épuisement des crédits</li>
              <li>Aucun remboursement n'est accordé pour les périodes déjà entamées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Propriété intellectuelle</h2>
            <p>Le contenu généré par HookGenerator est mis à disposition de l'utilisateur pour un usage personnel et commercial. SB SOLUTION INFO conserve les droits sur la technologie, l'interface et la marque HookGenerator. La reproduction ou revente de la plateforme est interdite.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Utilisation acceptable</h2>
            <p className="mb-2">Il est interdit d'utiliser HookGenerator pour :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Générer du contenu illégal, haineux, discriminatoire ou trompeur</li>
              <li>Tenter de contourner les limites d'utilisation</li>
              <li>Revendre ou redistribuer les accès au service</li>
              <li>Utiliser le service via des scripts automatisés non autorisés</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Limitation de responsabilité</h2>
            <p>SB SOLUTION INFO ne peut être tenu responsable des contenus générés par l'intelligence artificielle. L'utilisateur est seul responsable de l'utilisation des contenus produits. Le service est fourni "tel quel" sans garantie de résultats spécifiques.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Modification des CGU</h2>
            <p>SB SOLUTION INFO se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications importantes. La poursuite de l'utilisation du service vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">10. Droit applicable</h2>
            <p>Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront compétents. Pour toute question : <a href="mailto:contact@hookgenerator.eu" className="text-pink-400 hover:underline">contact@hookgenerator.eu</a></p>
          </section>
        </div>
      </div>
    </main>
  );
}