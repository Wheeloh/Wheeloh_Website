"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function Legal() {
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
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Mentions légales de Wheeloh</h2>
            
            <h4 className="text-xl font-semibold mt-8">1. Éditeur du site</h4>
            <p>
              Le site web <strong>Wheeloh</strong> est édité par :<br />
              Henri d'Aboville, Théophile Bonte et Antoine Savoyant, personnes physiques.<br />
              Adresse : 48 bis rue des Chantiers, 78000 Versailles, France<br />
              Téléphone : +33 7 52 05 25 59<br />
              Adresse e-mail : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a><br />
              Site web : <a href="https://wheeloh.com" className="text-blue-600 hover:underline">https://wheeloh.com</a>
            </p>

            {/*<h4 className="text-xl font-semibold mt-8">2. Forme juridique et immatriculation</h4>
            <p>
              Les éditeurs sont inscrits au Registre du Commerce et des Sociétés (RCS) de Paris sous les numéros suivants :<br />
              ○ Henri d'Aboville : RCS Paris 123 456 789<br />
              ○ Théophile Bonte : RCS Paris 987 654 321<br />
              ○ Antoine Savoyant : RCS Paris 321 654 987
            </p>*/}

            <h4 className="text-xl font-semibold mt-8">2. Hébergement du site</h4>
            <p>
              Le site Wheeloh est hébergé par :<br />
              <strong>Netlify, Inc.</strong><br />
              Siège social : 2325 3rd Street, Suite 215, San Francisco, California 94107, États-Unis<br />
              Téléphone : +1 415 448 5988<br />
              Site web : <a href="https://www.netlify.com" className="text-blue-600 hover:underline">https://www.netlify.com</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">3. Propriété intellectuelle</h4>
            <p>
              L'ensemble des contenus présents sur le site (textes, images, logos, graphismes, etc.) est protégé par le droit d'auteur (Code de la propriété intellectuelle) et le droit des marques. Toute reproduction, distribution ou exploitation, même partielle, sans autorisation expresse est interdite.
            </p>

            <h4 className="text-xl font-semibold mt-8">4. Données personnelles</h4>
            <p>
              Le site Wheeloh ne collecte aucune donnée personnelle, à l'exception de l'adresse e-mail que l'utilisateur renseigne volontairement via le formulaire de contact.<br />
              ○ Finalité : uniquement répondre aux demandes.<br />
              ○ Conservation : les données sont supprimées sous 30 jours après le traitement.<br />
              ○ Destinataires : aucune transmission à des tiers.<br /><br />
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée, l'utilisateur dispose d'un droit :<br />
              ○ d'accès,<br />
              ○ de rectification,<br />
              ○ d'effacement,<br />
              ○ de limitation du traitement,<br />
              ○ d'opposition,<br />
              ○ de portabilité.<br /><br />
              Pour exercer ces droits, contacter l'éditeur à : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a> ou par courrier postal à l'adresse de l'éditeur.
            </p>

            <h4 className="text-xl font-semibold mt-8">5. Cookies et traceurs</h4>
            <p>
              Aucune trace de cookies ou de technologies similaires n'est utilisée sur Wheeloh.<br />
              Si des cookies techniques étaient mis en place, l'utilisateur en serait informé préalablement et pourrait donner son consentement.
            </p>

            <h4 className="text-xl font-semibold mt-8">6. Responsabilité</h4>
            <p>
              L'éditeur s'efforce de fournir des informations fiables et à jour, mais ne peut garantir l'exactitude, la complétude ou l'actualité des contenus. L'utilisation des informations présentes sur le site se fait sous la seule responsabilité de l'utilisateur.
            </p>

            <h4 className="text-xl font-semibold mt-8">7. Conditions générales d'utilisation (CGU)</h4>
            <p>
              L'accès et l'utilisation du site sont soumis aux CGU disponibles à l'adresse : <a href="https://wheeloh.com/cgu" className="text-blue-600 hover:underline">https://wheeloh.com/cgu</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">8. Contact</h4>
            <p>
              Pour toute question relative aux mentions légales, vous pouvez contacter l'éditeur :<br />
              ○ Par e‑mail : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a><br />
              ○ Par courrier postal : 12 rue de la Liberté, 75011 Paris, France
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              Dernière mise à jour : 26/04/2025<br />
              Version : 0.2
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 