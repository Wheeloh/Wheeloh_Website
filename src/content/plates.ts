import type { LocalizedDoc } from "./types";

// "Blur license plate", "flouter plaque d'immatriculation".
export const plates: LocalizedDoc = {
  en: {
    title: "Blur Licence Plates in Car Photos, Automatically",
    description:
      "Wheeloh finds and erases number plates in your car photos on your phone, before anything is uploaded. Free on iPhone and Android.",
    crumb: "Licence plate blur",
    h1: "Plates disappear",
    subtitle: "before you post.",
    intro:
      "Every car photo you post on Wheeloh has its number plates found and erased on your phone, before the picture is uploaded. No editing app, no blur box drawn by hand — and the car still looks clean.",
    facts: [
      { value: "On-device", label: "the photo never leaves with its plate" },
      { value: "Automatic", label: "every plate in the frame is found" },
      { value: "By hand", label: "mask a plate yourself if needed" },
      { value: "Your call", label: "choose to show a plate" },
    ],
    showcase: "plates",
    sections: [
      {
        h2: "Why hide a number plate?",
        paragraphs: [
          "A number plate leads to a car's owner. In the European Union it counts as **personal data**, and publishing it can expose the owner to unwanted attention — or you to a complaint.",
          "For spotters, masking plates is simply good manners: the car is the subject, not the person who owns it. The best spotting accounts have done it for years, usually by hand, photo after photo.",
        ],
      },
      {
        h2: "How Wheeloh masks plates",
        steps: [
          { title: "Take the photo", body: "Shoot with the Wheeloh camera and open the publish page." },
          { title: "Plates are found", body: "Detection runs on the phone. Several plates in one shot? Each one is found." },
          { title: "Plates are erased", body: "Rather than a blur box, the registration is erased from the plate, so the car still looks clean." },
          { title: "Then it's uploaded", body: "Only the masked photo is sent. The original plate never leaves your phone." },
        ],
      },
      {
        h2: "You stay in control",
        list: [
          "**Missed one?** Mask any plate by hand before posting.",
          "**Your own car?** Choose to show the plate if you want it visible.",
          "**A plate is part of the story?** A personalised or vintage plate can stay — it's your decision, post by post.",
        ],
      },
      {
        h2: "Erased, not blurred",
        paragraphs: [
          "A blurred rectangle draws the eye straight to where the plate was. Wheeloh's on-device engine erases the registration itself, so the photo still looks like a photo of the car, not like a censored document.",
          "It is the same engine on every phone, built into the publish flow of the app: there is nothing to install and nothing to switch on.",
        ],
      },
    ],
    faq: [
      {
        question: "Is it legal to post a car photo with the plate visible?",
        answer:
          "In the EU a number plate can identify a person, so it is treated as personal data. Publishing it is risky and can breach privacy rules; masking it is the safe choice.",
      },
      {
        question: "Does the original photo with the plate get uploaded?",
        answer: "No. Plates are erased on your phone before the photo is uploaded; only the masked version is sent.",
      },
      {
        question: "Can I keep a plate visible?",
        answer: "Yes. You can choose to show a plate before posting, for example on your own car.",
      },
      {
        question: "Is plate masking free?",
        answer: "Yes. It is part of the free Wheeloh app on iPhone and Android.",
      },
    ],
    cta: { title: "Post spots without the plates.", body: "Free on iPhone and Android. Masking is on from your first photo." },
    related: ["carSpotting", "identify", "clubs", "meets"],
  },
  fr: {
    title: "Flouter une plaque d'immatriculation automatiquement",
    description:
      "Wheeloh détecte et efface les plaques d'immatriculation de tes photos de voitures, sur ton téléphone, avant tout envoi. Gratuite sur iPhone et Android.",
    crumb: "Flouter une plaque",
    h1: "Les plaques disparaissent",
    subtitle: "avant de publier.",
    intro:
      "Sur chaque photo de voiture publiée sur Wheeloh, les plaques d'immatriculation sont détectées et effacées sur ton téléphone, avant l'envoi. Pas d'app de retouche, pas de flou tracé à la main — et la voiture reste nette.",
    facts: [
      { value: "Sur le téléphone", label: "la photo ne part jamais avec sa plaque" },
      { value: "Automatique", label: "chaque plaque de l'image est trouvée" },
      { value: "À la main", label: "masque une plaque toi-même si besoin" },
      { value: "Ton choix", label: "affiche une plaque si tu veux" },
    ],
    showcase: "plates",
    sections: [
      {
        h2: "Pourquoi masquer une plaque d'immatriculation ?",
        paragraphs: [
          "Une plaque permet de remonter jusqu'au propriétaire d'une voiture. La CNIL la considère comme une **donnée personnelle** : la publier peut exposer le propriétaire à une attention dont il ne veut pas — et t'exposer, toi, à une plainte.",
          "Pour un spotter, masquer les plaques relève du savoir-vivre : le sujet, c'est la voiture, pas la personne à qui elle appartient. Les meilleurs comptes de carspotting le font depuis des années, le plus souvent à la main, photo après photo.",
        ],
      },
      {
        h2: "Comment Wheeloh masque les plaques",
        steps: [
          { title: "Prends la photo", body: "Déclenche avec la caméra Wheeloh et ouvre la page de publication." },
          { title: "Les plaques sont détectées", body: "La détection tourne sur le téléphone. Plusieurs plaques sur la photo ? Chacune est trouvée." },
          { title: "Les plaques sont effacées", body: "Pas de rectangle flou : l'immatriculation est effacée de la plaque, et la voiture reste propre." },
          { title: "Puis la photo est envoyée", body: "Seule la photo masquée part. La plaque d'origine ne quitte jamais ton téléphone." },
        ],
      },
      {
        h2: "Tu gardes la main",
        list: [
          "**Une plaque oubliée ?** Masque-la à la main avant de publier.",
          "**C'est ta voiture ?** Choisis d'afficher la plaque si tu veux qu'elle reste visible.",
          "**La plaque fait partie de l'histoire ?** Une plaque personnalisée ou d'époque peut rester — c'est toi qui décides, post par post.",
        ],
      },
      {
        h2: "Effacée, pas floutée",
        paragraphs: [
          "Un rectangle flou attire l'œil exactement là où était la plaque. Le moteur de Wheeloh efface l'immatriculation elle-même, sur le téléphone : la photo ressemble toujours à une photo de voiture, pas à un document censuré.",
          "C'est le même moteur sur tous les téléphones, intégré à la publication dans l'app : rien à installer, rien à activer.",
        ],
      },
      {
        h2: "Et la loi, concrètement ?",
        paragraphs: [
          "Photographier une voiture dans l'espace public est autorisé en France : le propriétaire ne peut s'opposer à l'image de son bien qu'en cas de trouble anormal (Cour de cassation, assemblée plénière, 7 mai 2004). Ce qui pose problème, c'est ce qui identifie une personne : son visage, et sa plaque. Masquer la plaque avant de publier, c'est la bonne pratique. Ces repères ne remplacent pas un conseil juridique.",
        ],
      },
    ],
    faq: [
      {
        question: "A-t-on le droit de publier une photo de voiture avec la plaque ?",
        answer:
          "La CNIL considère la plaque d'immatriculation comme une donnée personnelle, puisqu'elle permet d'identifier le propriétaire. La publier est risqué ; la masquer est le choix sûr.",
      },
      {
        question: "La photo d'origine avec la plaque est-elle envoyée ?",
        answer: "Non. Les plaques sont effacées sur ton téléphone avant l'envoi ; seule la version masquée est envoyée.",
      },
      {
        question: "Puis-je laisser une plaque visible ?",
        answer: "Oui. Tu peux choisir d'afficher une plaque avant de publier, par exemple sur ta propre voiture.",
      },
      {
        question: "Le masquage des plaques est-il gratuit ?",
        answer: "Oui. Il fait partie de l'app Wheeloh, gratuite sur iPhone et Android.",
      },
    ],
    cta: { title: "Publie tes spots sans les plaques.", body: "Gratuite sur iPhone et Android. Le masquage est actif dès ta première photo." },
    related: ["carSpotting", "identify", "clubs", "meets"],
  },
};
