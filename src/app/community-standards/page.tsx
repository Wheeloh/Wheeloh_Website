"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function CommunityStandards() {
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Standards Communautaires de Wheeloh</h2>
            
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 21/02/2024<br />
              Version : v0.2
            </p>

            <h3 className="text-2xl font-bold mt-8">1. Introduction</h3>
            <p>
              Wheeloh est un espace dédié aux passionnés de voitures pour partager des clichés 
              authentiques et échanger en communauté. Ces règles garantissent un 
              environnement <strong>respectueux, sûr et légal</strong> pour tous, en particulier les utilisateurs de 
              <strong>13 à 25 ans</strong>.
            </p>

            <h3 className="text-2xl font-bold mt-8">2. Comportements attendus</h3>
            <ul>
              <li>
                <strong>Authenticité :</strong>
                <ul>
                  <li>• Photos prises uniquement via l'appareil photo de Wheeloh (pas d'import externe).</li>
                  <li>Pseudonymes autorisés, mais interdiction d'usurper une identité (ex : marques, célébrités).</li>
                </ul>
              </li>
              <li>
                <strong>Respect :</strong>
                <ul>
                  <li>• Aucune insulte, discrimination, harcèlement ou langage dégradant.</li>
                  <li>• Pas de publication/commentaire glorifiant la violence ou les actes illégaux.</li>
                </ul>
              </li>
              <li>
                <strong>Transparence :</strong>
                <ul>
                  <li>• Les partenariats ou promotions doivent être explicitement mentionnés.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">3. Contenu interdit</h3>
            <p><strong>Sur les publications, descriptions et commentaires :</strong></p>
            <ul>
              <li>
                <strong>Violence/Incitation :</strong>
                <ul>
                  <li>• Contenu violent (ex : accidents filmés, street racing illégal).</li>
                  <li>• Promotion d'actes criminels (vols de voitures, vandalisme).</li>
                </ul>
              </li>
              <li>
                <strong>Haine :</strong>
                <ul>
                  <li>• Discriminations (racisme, sexisme, LGBTQIA+phobie), symboles extrémistes.</li>
                </ul>
              </li>
              <li>
                <strong>Exploitation humaine :</strong>
                <ul>
                  <li>• Trafic d'êtres humains, travail forcé, ou contenus sexualisés non consentis.</li>
                </ul>
              </li>
              <li>
                <strong>Santé mentale :</strong>
                <ul>
                  <li>• Incitation au suicide, à l'automutilation, ou aux troubles alimentaires.</li>
                </ul>
              </li>
              <li>
                <strong>Fausses informations :</strong>
                <ul>
                  <li>• Désinformation sur la sécurité routière, les réglementations automobiles, ou les marques.</li>
                </ul>
              </li>
            </ul>

            <p><strong>Dans le chat :</strong></p>
            <ul>
              <li>
                <strong>Sécurité des mineurs :</strong>
                <ul>
                  <li>• Aucune sollicitation sexuelle, image NSFW, ou discussion inappropriée avec un mineur.</li>
                </ul>
              </li>
              <li>
                <strong>Arnaques :</strong>
                <ul>
                  <li>• Interdiction de promouvoir des "offres exclusives", concours frauduleux, ou phishing.</li>
                </ul>
              </li>
              <li>
                <strong>Cybersécurité :</strong>
                <ul>
                  <li>• Partage interdit de liens suspects, logiciels piratés, ou méthodes de hacking.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">4. Règles spécifiques</h3>
            <ul>
              <li>
                <strong>Propriété intellectuelle :</strong>
                <ul>
                  <li>• Interdiction de publier des logos/marques sans autorisation (ex : photos de salons auto protégés par copyright).</li>
                </ul>
              </li>
              <li>
                <strong>Biens restreints :</strong>
                <ul>
                  <li>• Pas de promotion de pièces volées, produits illégaux (ex : pot d'échappement non homologué).</li>
                </ul>
              </li>
              <li>
                <strong>Vie privée :</strong>
                <ul>
                  <li>• Interdiction de partager des informations personnelles (plaques d'immatriculation, adresses) sans consentement.</li>
                </ul>
              </li>
              <li>
                <strong>Organisations dangereuses :</strong>
                <ul>
                  <li>• Aucun soutien aux groupes criminels (ex : gangs liés au vol de voitures).</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">5. Signalement et sanctions</h3>
            <ul>
              <li>
                <strong>Comment signaler :</strong>
                <ul>
                  <li>• Bouton "Signaler" sur tout contenu ou profil suspect.</li>
                  <li>• Urgences (ex : exploitation de mineurs) : contact immédiat à contact@wheeloh.com.</li>
                </ul>
              </li>
              <li>
                <strong>Sanctions graduelles :</strong>
                <ul>
                  <li>• 1ᵉʳ avertissement : Suppression du contenu + notification.</li>
                  <li>• 2ᵉ avertissement : Suspension 7 jours + alerte aux parents pour les mineurs.</li>
                  <li>• 3ᵉ violation : Bannissement définitif + signalement aux autorités si nécessaire.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">6. Protection des mineurs</h3>
            <ul>
              <li>
                <strong>Filtres automatisés :</strong>
                <ul>
                  <li>• Détection des mots-clés à risque (ex : "rencontre", "suicide") dans les chats.</li>
                </ul>
              </li>
              <li>
                <strong>Contrôle parental :</strong>
                <ul>
                  <li>• Option pour limiter les interactions avec des inconnus (en développement).</li>
                </ul>
              </li>
              <li>
                <strong>Signalement prioritaire :</strong>
                <ul>
                  <li>• Tout contact suspect envers un mineur est traité en moins de 48h.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">7. Conformité légale</h3>
            <ul>
              <li>
                <strong>RGPD/COPPA :</strong>
                <ul>
                  <li>• Les données des moins de 16 ans nécessitent l'accord parental.</li>
                </ul>
              </li>
              <li>
                <strong>Lois locales :</strong>
                <ul>
                  <li>• Adaptation aux réglementations européennes (ex : Allemagne sur les symboles extrémistes) et américaines.</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-2xl font-bold mt-8">8. Demandes des utilisateurs</h3>
            <ul>
              <li>• Suppression de compte : Possible via les paramètres du profil.</li>
              <li>• Accès aux données : Demande par e-mail à <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a>.</li>
            </ul>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 