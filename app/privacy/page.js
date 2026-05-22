export default function Privacy() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-xs text-gray-500 hover:text-pink-400 transition mb-6 inline-block">← Retour</a>
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Politique de Confidentialité</h1>
        <p className="text-gray-500 text-sm mb-8">Dernière mise à jour : mai 2025</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-bold text-lg mb-3">1. Responsable du traitement</h2>
            <p>SB SOLUTION INFO, Carrières-sous-Poissy (78955), France.<br />Email : <a href="mailto:contact@hookgenerator.eu" className="text-pink-400 hover:underline">contact@hookgenerator.eu</a></p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">2. Données collectées</h2>
            <p className="mb-2">Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Nom, prénom, surnom et adresse email lors de l'inscription</li>
              <li>Données de paiement (traitées par Stripe, non stockées par nous)</li>
              <li>Contenus générés et sauvegardés (hooks, idées, légendes)</li>
              <li>Données d'utilisation (nombre de générations, plateforme utilisée)</li>
              <li>Adresse IP pour la limitation des abus</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">3. Finalités du traitement</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Fourniture et amélioration du service</li>
              <li>Gestion des comptes et abonnements</li>
              <li>Prévention des abus et sécurité</li>
              <li>Communication avec les utilisateurs</li>
              <li>Obligations légales et comptables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">4. Base légale</h2>
            <p>Le traitement est fondé sur l'exécution du contrat (CGU), le consentement de l'utilisateur et les obligations légales applicables à SB SOLUTION INFO.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">5. Sous-traitants</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-white">Supabase</strong> — stockage des données (serveurs EU)</li>
              <li><strong className="text-white">Stripe</strong> — traitement des paiements</li>
              <li><strong className="text-white">OpenAI</strong> — génération de contenu par IA</li>
              <li><strong className="text-white">Vercel</strong> — hébergement de l'application</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">6. Durée de conservation</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Données de compte : jusqu'à suppression du compte + 3 ans</li>
              <li>Données de paiement : 10 ans (obligation légale)</li>
              <li>Contenus générés : jusqu'à suppression par l'utilisateur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">7. Vos droits (RGPD)</h2>
            <p className="mb-2">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-2">Pour exercer ces droits : <a href="mailto:contact@hookgenerator.eu" className="text-pink-400 hover:underline">contact@hookgenerator.eu</a></p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">8. Cookies</h2>
            <p>HookGenerator utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-lg mb-3">9. Réclamation</h2>
            <p>Vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" className="text-pink-400 hover:underline" target="_blank">www.cnil.fr</a></p>
          </section>
        </div>
      </div>
    </main>
  );
}