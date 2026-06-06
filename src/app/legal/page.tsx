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
                        <h4 className="text-xl font-semibold mt-8">1. Éditeur du Site et de l'Application</h4>
            <p>
              L’application mobile « Wheeloh » et le site internet associé (<a href="https://wheeloh.com" className="text-blue-600 hover:underline">https://wheeloh.com</a>) sont édités par :<br />
              <strong>Wheeloh</strong>, Société par Actions Simplifiée (SAS) au capital variable de 20 euros.<br />
              Siège social : Bâtiment B, 155 Boulevard de la Reine, 78000 Versailles, France<br />
              Immatriculée au Registre du Commerce et des Sociétés (RCS) de Versailles sous le numéro <strong>995 071 040</strong><br />
              Numéro de TVA intracommunautaire : <em>Non applicable</em>
            </p>
            <p className="mt-4">
              <strong>Contact :</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Téléphone : +33 7 52 05 25 59</li>
              <li>Adresse e-mail : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a></li>
              <li>Site web : <a href="https://wheeloh.com" className="text-blue-600 hover:underline">https://wheeloh.com</a></li>
            </ul>

            <h4 className="text-xl font-semibold mt-8">2. Hébergement</h4>
            <p>
              <strong>Hébergement du site web vitrine :</strong><br />
              Netlify, Inc.<br />
              Siège social : 2325 3rd Street, Suite 215, San Francisco, California 94107, États-Unis<br />
              Téléphone : +1 415 448 5988<br />
              Site web : <a href="https://www.netlify.com" className="text-blue-600 hover:underline">https://www.netlify.com</a>
            </p>
            <p className="mt-4">
              <strong>Hébergement de l’Application mobile et des données Utilisateurs (Base de données) :</strong><br />
              Google Ireland Limited (Firebase)<br />
              Siège social : Gordon House, Barrow Street, Dublin 4, Irlande<br />
              Site web : <a href="https://firebase.google.com" className="text-blue-600 hover:underline">https://firebase.google.com</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">3. Propriété intellectuelle</h4>
            <p>
              L'ensemble des contenus présents sur le site et l'application (textes, images, logos, graphismes, etc.) est protégé par le droit d'auteur (Code de la propriété intellectuelle) et le droit des marques.
              Toute reproduction, distribution ou exploitation, même partielle, sans autorisation expresse est interdite.
            </p>

            <h4 className="text-xl font-semibold mt-8">4. Données personnelles</h4>
            <p>
              Le site Wheeloh ne collecte aucune donnée personnelle, à l'exception de l'adresse e-mail que l'utilisateur renseigne volontairement via le formulaire de contact.
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-4">
              <li><strong>Finalité :</strong> uniquement répondre aux demandes.</li>
              <li><strong>Conservation :</strong> les données sont supprimées sous 30 jours après le traitement.</li>
              <li><strong>Destinataires :</strong> aucune transmission à des tiers.</li>
            </ul>
            <p className="mt-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi "Informatique et Libertés" du 6 janvier 1978 modifiée, l'utilisateur dispose d'un droit :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>d'accès,</li>
              <li>de rectification,</li>
              <li>d'effacement,</li>
              <li>de limitation du traitement,</li>
              <li>d'opposition,</li>
              <li>de portabilité.</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contacter l'éditeur à : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a> ou par courrier postal à l'adresse du siège social.
            </p>

            <h4 className="text-xl font-semibold mt-8">5. Cookies et traceurs</h4>
            <p>
              Aucune trace de cookies ou de technologies similaires n'est utilisée sur le site vitrine Wheeloh.<br />
              Si des cookies techniques ou traceurs devaient être mis en place (notamment sur l'application), l'utilisateur en serait informé préalablement et pourrait donner son consentement.
            </p>

            <h4 className="text-xl font-semibold mt-8">6. Responsabilité</h4>
            <p>
              L'éditeur s'efforce de fournir des informations fiables et à jour, mais ne peut garantir l'exactitude, la complétude ou l'actualité des contenus. L'utilisation des informations présentes sur le site se fait sous la seule responsabilité de l'utilisateur.
            </p>

            <h4 className="text-xl font-semibold mt-8">7. Conditions générales d'utilisation (CGU)</h4>
            <p>
              L'accès et l'utilisation du site et de l'application sont soumis aux CGU disponibles à l'adresse : <a href="https://wheeloh.com/cgu" className="text-blue-600 hover:underline">https://wheeloh.com/cgu</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">8. Nous contacter</h4>
            <p>
              Pour toute question relative aux mentions légales, vous pouvez contacter l'éditeur :
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Par e‑mail :</strong> <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a></li>
              <li><strong>Par courrier postal :</strong> Wheeloh, Bât B, 155 Boulevard de la Reine, 78000 Versailles, France</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-8">
              Dernière mise à jour : 06/06/2026<br />
              Version : 0.3
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 