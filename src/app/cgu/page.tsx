"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function CGU() {
  const buildTitle = (title: string) => (
    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-8">{title}</h1>
  );

  const buildSection = (title: string, children: React.ReactNode[]) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );

  const buildSubSection = (title: string, content: string) => (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="text-gray-700 whitespace-pre-line">
        {content}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Header showNavLinks={true} />

      <main className="flex-1 container px-4 md:px-6 py-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div className="prose prose-gray max-w-none">
            {buildTitle('Conditions Générales d\'Utilisation (CGU) de Wheeloh')}
            
            {buildSection(
              '1. Introduction',
              [
                buildSubSection('1.1 Objet des CGU', 
                  'Les présentes Conditions Générales d\'Utilisation (ci-après « CGU ») définissent les règles d\'accès, d\'utilisation et de fonctionnement de l\'application mobile « Wheeloh » (ci-après « l\'Application »), développée par Henri d\'Aboville, Théophile Bonte et Antoine Savoyant (ci-après « l\'Éditeur »). L\'Application est accessible sur la plateforme mobile Android.'
                ),
                buildSubSection('1.2 Description de l\'Application',
                  'Wheeloh est une application destinée aux passionnés d\'automobiles (« carspotters »). Elle permet aux Utilisateurs de :\n\n'
                  + '● Rechercher et photographier des véhicules\n'
                  + '● Publier des photographies sur un fil d\'actualité privé, accessible uniquement à leurs amis\n'
                  + '● Ajouter des descriptions et des commentaires sous les publications\n'
                  + '● Échanger avec d\'autres Utilisateurs via un chat instantané (personnel ou groupé).'
                ),
                buildSubSection('1.3 Éditeur',
                  'L\'Application est éditée par :\n'
                  + 'Henri d\'Aboville, Théophile Bonte et Antoine Savoyant\n'
                  + 'Adresse électronique : contact@wheeloh.com\n'
                  + 'Site web : wheeloh.com'
                ),
                buildSubSection('1.4 Définitions',
                  '● Utilisateur : Toute personne physique utilisant l\'Application.\n'
                  + '● Contenu : Photographies, messages, ou tout autre élément publié via l\'Application.\n'
                  + '● Service : Ensemble des fonctionnalités offertes par Wheeloh.'
                ),
              ]
            )}

            {buildSection(
              '2. Acceptation des CGU',
              [
                buildSubSection('2.1 Consentement',
                  'L\'utilisation de l\'Application Wheeloh implique l\'acceptation pleine et entière des présentes CGU. En créant un compte ou en accédant au Service, l\'Utilisateur reconnaît avoir pris connaissance de ces conditions et s\'engage à les respecter.'
                ),
                buildSubSection('2.2 Restrictions d\'âge',
                  'L\'Application est interdite aux personnes de moins de 13 ans (ou l\'âge légal requis dans leur pays de résidence). Les mineurs doivent obtenir l\'accord préalable de leur représentant légal avant toute utilisation.'
                ),
                buildSubSection('2.3 Modification des CGU',
                  'L\'Éditeur se réserve le droit de modifier les CGU à tout moment. Les Utilisateurs seront informés des changements :\n'
                  + '● Par notification via l\'Application ;\n'
                  + '● Ou par courriel (si l\'Utilisateur a fourni une adresse valide).\n'
                  + 'La poursuite de l\'utilisation du Service après notification vaut acceptation des nouvelles CGU.'
                ),
              ]
            )}

            {buildSection(
              '3. Obligations des Utilisateurs',
              [
                buildSubSection('3.1 Respect des lois',
                  'L\'Utilisateur s\'engage à :\n'
                  + '● Utiliser l\'Application conformément aux lois en vigueur dans son pays de résidence ;\n'
                  + '● Ne pas publier de contenu illicite, diffamatoire, injurieux, ou portant atteinte aux droits d\'autrui (droit à l\'image, droit d\'auteur, etc.) ;\n'
                  + '● Ne pas utiliser l\'Application à des fins commerciales sans l\'accord préalable de l\'Éditeur.'
                ),
                buildSubSection('3.2 Comportement',
                  'L\'Utilisateur s\'interdit de :\n'
                  + '● Harceler, menacer ou intimider d\'autres Utilisateurs ;\n'
                  + '● Publier des contenus violents, pornographiques, ou contraires à l\'ordre public ;\n'
                  + '● Utiliser l\'Application pour diffuser des virus, logiciels malveillants, ou tout autre contenu nuisible.'
                ),
                buildSubSection('3.3 Compte utilisateur',
                  'L\'Utilisateur s\'engage à :\n'
                  + '● Fournir des informations exactes et à jour lors de la création de son compte ;\n'
                  + '● Protéger ses identifiants de connexion (login, mot de passe) ;\n'
                  + '● Informer immédiatement l\'Éditeur via contact@wheeloh.com en cas de suspicion de piratage ou d\'utilisation non autorisée de son compte.'
                ),
                buildSubSection('3.4 Contenu publié',
                  'L\'Utilisateur garantit :\n'
                  + '● Qu\'il détient tous les droits nécessaires sur les photographies et messages qu\'il publie ;\n'
                  + '● Que ses publications ne portent pas atteinte aux droits de tiers (droit à l\'image, droit d\'auteur, etc.).'
                ),
              ]
            )}

            {buildSection(
              '4. Vie privée et données personnelles',
              [
                buildSubSection('4.1 Collecte des données',
                  'Wheeloh collecte les catégories de données suivantes :\n'
                  + '● Informations de compte (adresse e-mail, pseudonyme, photo de profil) ;\n'
                  + '● Identifiants d\'authentification gérés par Firebase Auth (mots de passe hachés, jetons OAuth) ;\n'
                  + '● Contenus publiés (photographies, commentaires, messages) ;\n'
                  + '● Identifiants techniques et de sécurité (adresses IP, jetons FCM, type d\'appareil, système d\'exploitation, version de l\'application) ;\n'
                  + '● Statistiques d\'usage anonymisées (pages consultées, durée de session, interactions, crash logs) collectées via Firebase Analytics et Sentry ;\n'
                  + 'Toutes les communications sont protégées par TLS 1.2 ou supérieur et les données sont stockées chiffrées au repos sur l\'infrastructure Google Cloud (Firestore, Cloud Storage).'
                ),
                buildSubSection('4.2 Utilisation des données',
                  'Nous utilisons vos données pour :\n'
                  + '● Fournir, maintenir et améliorer le Service ;\n'
                  + '● Personnaliser l\'expérience utilisateur et recommander du contenu pertinent ;\n'
                  + '● Assurer la sécurité (détection d\'abus, prévention du spam et de la fraude) ;\n'
                  + '● Réaliser des statistiques anonymisées afin d\'optimiser les performances ;\n'
                  + '● Respecter nos obligations légales et réglementaires.\n'
                  + 'Vos données ne sont jamais vendues. Toute opération marketing s\'effectue uniquement à l\'intérieur de l\'application et reste sous votre contrôle (opt-in notifications).'
                ),
                buildSubSection('4.3 Partage des données',
                  'Nous ne partageons vos données qu\'avec :\n'
                  + '● Nos sous-traitants techniques indispensables au fonctionnement du Service (Firebase, Google Cloud, Sentry), tous soumis à des accords de traitement des données conformes au RGPD ;\n'
                  + '● Les autorités compétentes, uniquement sur base d\'une obligation légale dûment justifiée.\n'
                  + 'Aucun transfert n\'est réalisé à des fins commerciales ou publicitaires.'
                ),
                buildSubSection('4.4 Droits des Utilisateurs',
                  'Conformément au RGPD (UE) et aux lois applicables, l\'Utilisateur dispose des droits suivants :\n'
                  + '● Accéder à ses données ;\n'
                  + '● Les rectifier ou les supprimer ;\n'
                  + '● S\'opposer à leur traitement.\n'
                  + 'Pour exercer ces droits, l\'Utilisateur peut contacter l\'Éditeur à l\'adresse suivante : contact@wheeloh.com.'
                ),
                buildSubSection('4.5 Cookies',
                  'Wheeloh utilise des cookies et/ou un stockage local (SharedPreferences, Secure Storage) pour mémoriser vos préférences (langue, paramètres de notifications) et maintenir votre session ouverte. Vous pouvez supprimer ces données à tout moment depuis les paramètres de votre appareil ou via la fonction « Déconnexion ».'
                ),
              ]
            )}

            {buildSection(
              '5. Responsabilité et garanties',
              [
                buildSubSection('5.1 Limitation de responsabilité',
                  'L\'Éditeur décline toute responsabilité pour :\n'
                  + '● Les dommages indirects (perte de données, préjudice moral) liés à l\'utilisation de l\'Application ;\n'
                  + '● Les contenus publiés par les Utilisateurs ;\n'
                  + '● Les interruptions de service dues à des événements indépendants de sa volonté (ex : panne technique, force majeure).'
                ),
                buildSubSection('5.2 Garanties',
                  'L\'Application est fournie « en l\'état », sans garantie d\'aucune sorte, expresse ou implicite. L\'Éditeur ne garantit pas :\n'
                  + '● La disponibilité continue du Service ;\n'
                  + '● L\'absence de bugs ou d\'erreurs ;\n'
                  + '● La conformité du Service aux attentes spécifiques de l\'Utilisateur.'
                ),
              ]
            )}

            {buildSection(
              '6. Propriété intellectuelle',
              [
                buildSubSection('6.1 Droits de l\'Éditeur',
                  'L\'Application Wheeloh, son contenu (design, logos, textes, graphismes, etc.) et les technologies associées sont la propriété exclusive de l\'Éditeur ou de ses partenaires.\n'
                  + 'Toute reproduction, modification, distribution ou exploitation non autorisée est strictement interdite.'
                ),
                buildSubSection('6.2 Droits des Utilisateurs',
                  'Les utilisateurs conservent la propriété intellectuelle sur les contenus qu\'ils publient. Toutefois, en publiant du contenu sur l\'Application, l\'utilisateur accorde à l\'Éditeur une licence non exclusive, mondiale, gratuite et limitée à la durée de publication du contenu, pour utiliser, reproduire, modifier, afficher et distribuer ledit contenu uniquement dans le cadre du Service, y compris pour son amélioration, sa promotion ou son bon fonctionnement. L\'Éditeur s\'engage à respecter les droits moraux de l\'utilisateur, notamment le droit à la paternité et à l\'intégrité de l\'œuvre. La licence prend fin lorsque l\'utilisateur supprime son contenu ou son compte, sauf si le contenu a été partagé ou réutilisé par d\'autres utilisateurs conformément aux présentes CGU. L\'Éditeur ne peut sous-licencier ou transférer cette licence à des tiers qu\'avec l\'accord préalable de l\'utilisateur.'
                ),
              ]
            )}

            {buildSection(
              '7. Résiliation',
              [
                buildSubSection('7.1 Par l\'Utilisateur',
                  'L\'Utilisateur peut résilier son compte à tout moment via les paramètres de l\'Application.'
                ),
                buildSubSection('7.2 Par l\'Éditeur',
                  'L\'Éditeur peut résilier ou suspendre le compte d\'un Utilisateur en cas de :\n'
                  + '● Violation des CGU ;\n'
                  + '● Comportement nuisible à la communauté ;\n'
                  + '● Activité suspecte ou frauduleuse.'
                ),
                buildSubSection('7.3 Conséquences de la résiliation',
                  'En cas de résiliation :\n'
                  + '● Le compte de l\'Utilisateur sera désactivé ;\n'
                  + '● Les contenus publiés pourront être supprimés définitivement.'
                ),
              ]
            )}

            {buildSection(
              '8. Dispositions finales',
              [
                buildSubSection('8.1 Droit applicable',
                  'Les présentes CGU sont régies par le droit Français.'
                ),
                buildSubSection('8.2 Recours amiable',
                  'En cas de désaccord, l\'Utilisateur et l\'Éditeur s\'engagent à rechercher une solution amiable avant toute action en justice.'
                ),
                buildSubSection('8.3 Force majeure',
                  'L\'Éditeur ne pourra être tenu responsable en cas de force majeure (ex : catastrophe naturelle, guerre, pandémie).'
                ),
                buildSubSection('8.4 Divisibilité',
                  'Si une clause des CGU est jugée invalide, les autres clauses resteront pleinement applicables.'
                ),
                buildSubSection('8.5 Langue',
                  'Les CGU sont rédigées en français. En cas de traduction, seule la version originale fera foi.'
                ),
                buildSubSection('8.6 Contact',
                  'Pour toute question concernant les CGU, l\'Utilisateur peut contacter l\'Éditeur à l\'adresse suivante : contact@wheeloh.com.'
                ),
              ]
            )}

            <p className="text-sm text-muted-foreground mt-8">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}<br />
              Version : 1.0
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 