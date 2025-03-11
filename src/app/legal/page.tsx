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
              <strong>Henri d'Aboville, Théophile Bonte et Antoine Savoyant</strong>, personnes physiques.<br />
              Adresse e-mail : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a><br />
              Site web : <a href="https://wheeloh.com" className="text-blue-600 hover:underline">https://wheeloh.com</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">2. Hébergement du site</h4>
            <p>
              Le site Wheeloh est hébergé par :<br />
              <strong>Netlify</strong><br />
              Siège social : 2325 3rd Street, Suite 215, San Francisco, California 94107, États-Unis<br />
              Site web : <a href="https://www.netlify.com" className="text-blue-600 hover:underline">https://www.netlify.com</a>
            </p>

            <h4 className="text-xl font-semibold mt-8">3. Propriété intellectuelle</h4>
            <p>
              L'ensemble des contenus présents sur le site (textes, images, logos, graphismes, etc.) sont protégés par le droit d'auteur et le droit des marques. Toute reproduction, distribution ou exploitation sans autorisation préalable est interdite.
            </p>

            <h4 className="text-xl font-semibold mt-8">4. Données personnelles</h4>
            <p>
              Le site Wheeloh ne collecte aucune donnée personnelle à l'exception de l'adresse e-mail que l'utilisateur renseigne volontairement via le formulaire de contact. Ces informations sont utilisées uniquement pour répondre aux demandes et ne sont ni stockées ni transmises à des tiers.<br /><br />
              Conformément au Règlement Général sur la Protection des Données (RGPD), l'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant l'éditeur à l'adresse suivante : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a>.
            </p>

            <h4 className="text-xl font-semibold mt-8">5. Cookies</h4>
            <p>
              Aucun cookie n'est utilisé sur le site <strong>Wheeloh</strong>.
            </p>

            <h4 className="text-xl font-semibold mt-8">6. Responsabilité</h4>
            <p>
              L'éditeur s'efforce de fournir des informations exactes et à jour sur le site, mais ne saurait être tenu responsable des erreurs ou omissions. L'utilisation du site se fait sous la responsabilité de l'utilisateur.
            </p>

            <h4 className="text-xl font-semibold mt-8">7. Contact</h4>
            <p>
              Pour toute question relative aux mentions légales, vous pouvez contacter l'éditeur par e-mail à <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a>.<br />
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              Dernière mise à jour : 20/02/2025<br />
              Version : 0.1
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
} 