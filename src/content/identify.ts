import type { LocalizedDoc } from "./types";

// "Car identifier", "identify a car from a photo", "reconnaître une voiture".
export const identify: LocalizedDoc = {
  en: {
    title: "Car Identifier: Identify Any Car From a Photo",
    description:
      "Point your phone at a car and Wheeloh tells you the make, model and version, with its specs and a score. Over 23,000 versions, free on iOS and Android.",
    crumb: "Car identifier",
    h1: "Identify any car",
    subtitle: "from one photo.",
    intro:
      "Take a photo and Wheeloh tells you what you are looking at — make, model and version — with its spec sheet and the points it is worth. The identification is matched against a database of more than 23,000 versions from over 150 brands, from 1904 to today.",
    facts: [
      { value: "23,000+", label: "versions recognised" },
      { value: "150+", label: "brands, from AC to Zenvo" },
      { value: "1904–2026", label: "model years covered" },
      { value: "Free", label: "no subscription, no paywall" },
    ],
    showcase: "camera",
    sections: [
      {
        h2: "How Wheeloh identifies a car",
        steps: [
          { title: "Frame the car", body: "Open the camera tab. Wheeloh finds the car in the frame on your phone, even among other cars." },
          { title: "The model is identified", body: "Its AI recognises the make and model, then matches it to the right version in the Wheeloh database." },
          { title: "Read the spec sheet", body: "Power, torque, 0–100 km/h, top speed, weight and engine appear on the spot." },
          { title: "Keep the spot", body: "The car is scored, filed in its brand album and pinned on your map." },
        ],
      },
      {
        h2: "Every car, not just supercars",
        paragraphs: [
          "Many car identifier apps only know exotics. The Wheeloh database covers more than 23,000 versions across 1,680 models — hypercars and supercars, but also classics from the early 1900s, youngtimers, hot hatches and the everyday cars in between.",
          "A spot is worth more when the car is rarer, so a Golf won't score like a Chiron — but it will still be identified, and it still counts in your garage.",
        ],
      },
      {
        h2: "More than a name: specs and points",
        paragraphs: [
          "Each identification comes with the car's key figures, so you learn what makes it special while you're still standing next to it.",
          "Then it is scored on four layers — **performance, excitement, price and rarity**. An everyday car earns around 40 points, a supercar 1,000 to 2,000, an ultra-rare hypercar up to 3,000. Visibly modified cars get a **+25% tuning bonus**.",
        ],
      },
      {
        h2: "When the AI gets it wrong",
        paragraphs: [
          "No identifier is perfect: rare trims, heavy modifications or a car seen from far away can fool it. In Wheeloh you can **contest the model or the points** of any spot and say what the car really is.",
          "To keep the rankings fair, an anti-cheat system checks every photo: screenshots and pictures downloaded from the internet don't count.",
        ],
      },
      {
        h2: "Identify the cars already in your camera roll",
        paragraphs: [
          "Years of car photos on your phone? Gallery sync scans your camera roll in one tap, finds the cars and identifies them. Only genuine camera shots are kept, so your old spots join your garage without opening the door to cheating.",
        ],
      },
      {
        h2: "Tips for a reliable identification",
        list: [
          "Get the whole car in the frame, front or rear three-quarter if you can.",
          "Badges, lights and wheels are what tell versions apart: keep them visible.",
          "Avoid heavy digital zoom; walk closer or use the 2× lens.",
          "Several cars in one place? Post them as an album and each one is identified.",
        ],
      },
    ],
    faq: [
      {
        question: "Is there a free app to identify a car from a picture?",
        answer: "Yes. Wheeloh identifies cars from a photo for free on iPhone and Android, with no subscription.",
      },
      {
        question: "Can Wheeloh identify old or classic cars?",
        answer: "Yes. Its database spans model years from 1904 to 2026, so classics and youngtimers are recognised as well as new cars.",
      },
      {
        question: "Does it work offline?",
        answer: "The car is found in the frame on your phone, but the identification itself needs an internet connection.",
      },
      {
        question: "Can I identify a car from a photo I took earlier?",
        answer: "Yes. Gallery sync scans your camera roll and identifies the cars in your past photos. Screenshots and downloaded images are filtered out.",
      },
    ],
    cta: { title: "Find out what that car was.", body: "Free on iPhone and Android. Point, shoot, and the answer appears." },
    related: ["carSpotting", "cars", "plates", "guess"],
  },
  fr: {
    title: "Identifier une voiture en photo : l'app gratuite",
    description:
      "Prends une voiture en photo : Wheeloh te donne marque, modèle, version, fiche technique et points. Plus de 23 000 versions. Gratuite sur iOS et Android.",
    crumb: "Identifier une voiture",
    h1: "Reconnais n'importe quelle voiture",
    subtitle: "en une photo.",
    intro:
      "Prends une photo et Wheeloh te dit ce que tu as devant toi — marque, modèle et version — avec sa fiche technique et les points qu'elle rapporte. L'identification est comparée à une base de plus de 23 000 versions de plus de 150 marques, de 1904 à aujourd'hui.",
    facts: [
      { value: "23 000+", label: "versions reconnues" },
      { value: "150+", label: "marques, d'AC à Zenvo" },
      { value: "1904–2026", label: "années modèles couvertes" },
      { value: "Gratuit", label: "sans abonnement ni contenu payant" },
    ],
    showcase: "camera",
    sections: [
      {
        h2: "Comment Wheeloh reconnaît une voiture",
        steps: [
          { title: "Cadre la voiture", body: "Ouvre l'onglet caméra. Wheeloh repère la voiture dans l'image, sur ton téléphone, même au milieu d'autres voitures." },
          { title: "Le modèle est identifié", body: "Son IA reconnaît la marque et le modèle, puis retrouve la bonne version dans la base Wheeloh." },
          { title: "Lis la fiche technique", body: "Puissance, couple, 0–100 km/h, vitesse max, poids et moteur s'affichent aussitôt." },
          { title: "Garde le spot", body: "La voiture est notée, rangée dans l'album de sa marque et épinglée sur ta carte." },
        ],
      },
      {
        h2: "Toutes les voitures, pas seulement les supercars",
        paragraphs: [
          "Beaucoup d'apps de reconnaissance ne connaissent que les voitures d'exception. La base Wheeloh couvre plus de 23 000 versions sur 1 680 modèles — hypercars et supercars, mais aussi les anciennes du début du XXe siècle, les youngtimers, les GTI et toutes les voitures du quotidien entre les deux.",
          "Un spot vaut plus quand la voiture est plus rare : une Golf ne rapportera pas comme une Chiron — mais elle sera identifiée, et elle compte dans ton garage.",
        ],
      },
      {
        h2: "Plus qu'un nom : fiche technique et points",
        paragraphs: [
          "Chaque identification arrive avec les chiffres clés de la voiture : tu apprends ce qui la rend spéciale pendant que tu es encore à côté.",
          "Elle est ensuite notée sur quatre critères — **performances, attrait, prix et rareté**. Une voiture courante rapporte environ 40 points, une supercar de 1 000 à 2 000, une hypercar ultra-rare jusqu'à 3 000. Les voitures visiblement modifiées gagnent un **bonus tuning de +25 %**.",
        ],
      },
      {
        h2: "Quand l'IA se trompe",
        paragraphs: [
          "Aucune reconnaissance n'est parfaite : une finition rare, une grosse préparation ou une voiture vue de loin peuvent la piéger. Dans Wheeloh, tu peux **contester le modèle ou les points** de n'importe quel spot et indiquer la bonne voiture.",
          "Pour que les classements restent justes, un système anti-triche contrôle chaque photo : les captures d'écran et les images téléchargées sur internet ne comptent pas.",
        ],
      },
      {
        h2: "Identifie les voitures déjà dans ta pellicule",
        paragraphs: [
          "Des années de photos de voitures sur ton téléphone ? La synchronisation de galerie parcourt ta pellicule en un tap, y retrouve les voitures et les identifie. Seules les vraies photos prises avec l'appareil sont gardées : tes anciens spots rejoignent ton garage, sans ouvrir la porte à la triche.",
        ],
      },
      {
        h2: "Conseils pour une identification fiable",
        list: [
          "Garde toute la voiture dans le cadre, de trois-quarts avant ou arrière si possible.",
          "Logos, feux et jantes distinguent les versions : laisse-les visibles.",
          "Évite le gros zoom numérique ; rapproche-toi ou utilise l'objectif 2×.",
          "Plusieurs voitures au même endroit ? Publie-les en album : chacune est identifiée.",
        ],
      },
    ],
    faq: [
      {
        question: "Existe-t-il une application gratuite pour reconnaître une voiture ?",
        answer: "Oui. Wheeloh identifie les voitures en photo gratuitement sur iPhone et Android, sans abonnement.",
      },
      {
        question: "Wheeloh reconnaît-elle les voitures anciennes ?",
        answer: "Oui. Sa base couvre les années modèles de 1904 à 2026 : les anciennes et les youngtimers sont reconnues comme les voitures récentes.",
      },
      {
        question: "Ça marche sans connexion ?",
        answer: "La voiture est repérée dans l'image sur ton téléphone, mais l'identification elle-même a besoin d'une connexion internet.",
      },
      {
        question: "Puis-je identifier une voiture sur une photo déjà prise ?",
        answer: "Oui. La synchronisation de galerie parcourt ta pellicule et identifie les voitures de tes anciennes photos. Captures d'écran et images téléchargées sont écartées.",
      },
    ],
    cta: { title: "Découvre quelle était cette voiture.", body: "Gratuite sur iPhone et Android. Vise, déclenche, la réponse s'affiche." },
    related: ["carSpotting", "cars", "plates", "guess"],
  },
};
