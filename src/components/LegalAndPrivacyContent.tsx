"use client";
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function LegalAndPrivacy() {
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

            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mt-16">Politique de confidentialité</h2>

            <h4 className="text-xl font-semibold mt-8">1. Collecte des Données</h4>
            
            <h5 className="text-lg font-medium mt-4">1.1. Informations Personnelles Fournies par l'Utilisateur</h5>
            <p>
              Lors de votre inscription et de l'utilisation de l'application, nous pouvons vous demander de
              fournir certaines informations personnelles telles que :
            </p>
            <ul className="list-disc pl-6">
              <li>Nom</li>
              <li>Adresse e-mail</li>
              <li>Informations de profil (photo de profil)</li>
            </ul>

            <h5 className="text-lg font-medium mt-4">1.2. Contenu Partagé par l'Utilisateur</h5>
            <p>
              Wheeloh vous permet de prendre des photos de voitures dans la rue et de les publier sur
              votre feed, visible uniquement par vos amis. Dans ce cadre, nous collectons :
            </p>
            <ul className="list-disc pl-6">
              <li>Les images</li>
              <li>Les métadonnées associées (par exemple, la date, l'heure et la localisation géographique, si activée)</li>
              <li>Les descriptions, commentaires et interactions (likes, partages, commentaires, etc)</li>
            </ul>

            <h5 className="text-lg font-medium mt-4">1.3. Données d'Utilisation et Techniques</h5>
            <p>
              Nous recueillons également des données relatives à votre utilisation de l'application, notamment :
            </p>
            <ul className="list-disc pl-6">
              <li>Les logs d'activité (fréquence et durée de vos sessions, pages consultées, interactions via le chat, etc.)</li>
              <li>Système d'analyse pour améliorer votre expérience et analyser l'usage de l'application.</li>
            </ul>

            <h4 className="text-xl font-semibold mt-8">2. Utilisation des Données</h4>
            <p>Les informations collectées nous permettent de :</p>
            <ul className="list-disc pl-6">
              <li>Fournir et améliorer nos services : personnaliser votre expérience et garantir le bon fonctionnement de l'application.</li>
              <li>Gérer votre compte : assurer l'authenticité, la sécurité et la gestion des interactions sociales.</li>
              <li>Analyser l'usage : comprendre les tendances et adapter l'application à vos besoins.</li>
              <li>Assurer la sécurité : prévenir les comportements frauduleux et protéger l'intégrité de notre communauté.</li>
              <li>Respecter nos obligations légales.</li>
            </ul>

            <h4 className="text-xl font-semibold mt-8">3. Partage et Divulgation des Données</h4>
            <p>
              Nous nous engageons à ne pas vendre ou louer vos informations personnelles. Toutefois,
              nous pouvons partager vos données dans les cas suivants :
            </p>
            <ul className="list-disc pl-6">
              <li>Avec vos amis et contacts : uniquement dans le cadre de la visibilité restreinte de vos publications sur votre feed.</li>
              <li>Avec des prestataires de services tiers qui nous assistent dans l'exploitation de l'application, sous réserve de conditions de confidentialité strictes.</li>
              <li>En cas d'obligation légale : si la loi nous y contraint ou pour protéger nos droits, notre sécurité ou celle d'autrui.</li>
            </ul>

            <h4 className="text-xl font-semibold mt-8">4. Sécurité des Données</h4>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Néanmoins, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée.
            </p>

            <h4 className="text-xl font-semibold mt-8">5. Conservation des Données</h4>
            <p>Nous conservons vos données personnelles aussi longtemps que nécessaire pour :</p>
            <ul className="list-disc pl-6">
              <li>Vous fournir nos services</li>
              <li>Respecter nos obligations légales</li>
              <li>Résoudre les litiges et appliquer nos accords</li>
            </ul>
            <p>
              Après la fin de votre relation avec Wheeloh, vos données seront supprimées ou anonymisées, sauf obligation légale contraire.
            </p>

            <h4 className="text-xl font-semibold mt-8">6. Vos Droits</h4>
            <p>
              Conformément à la législation applicable, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul className="list-disc pl-6">
              <li>Droit d'accès : obtenir une copie de vos données</li>
              <li>Droit de rectification : corriger les informations inexactes ou incomplètes</li>
              <li>Droit à l'effacement : demander la suppression de vos données dans certaines conditions</li>
              <li>Droit à la limitation du traitement : restreindre le traitement de vos données</li>
              <li>Droit à la portabilité : recevoir vos données dans un format structuré et couramment utilisé</li>
              <li>Droit d'opposition : vous opposer à certains traitements de vos données</li>
            </ul>

            <h4 className="text-xl font-semibold mt-8">7. Modifications de la Politique de Confidentialité</h4>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. En cas de modifications importantes, nous vous en informerons via l'application ou par e-mail. Nous vous conseillons de consulter régulièrement cette page pour rester informé(e) des mises à jour.
            </p>

            <h4 className="text-xl font-semibold mt-8">8. Contact</h4>
            <p>
              Pour toute question ou demande relative à cette politique de confidentialité ou à vos données personnelles, merci de nous contacter :
            </p>
            <ul className="list-disc pl-6">
              <li>Par e-mail : <a href="mailto:contact@wheeloh.com" className="text-blue-600 hover:underline">contact@wheeloh.com</a></li>
              <li>Via la section « A propos de nous » de l'application dans les paramètres</li>
            </ul>

            <p className="text-sm text-muted-foreground mt-8">
              Dernière mise à jour : 20/02/2025<br />
              Version : 0.1
            </p>
          </div>
        </motion.section>
      </main>
      <Footer/>
    </div>
  );
} 