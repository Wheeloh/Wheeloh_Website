import type { LocalizedDoc } from "./types";

// "Car meets near me", "rasso voiture", "rassemblement auto".
export const meets: LocalizedDoc = {
  en: {
    title: "Car Meets Near Me: Find, Join and Share Car Meets",
    description:
      "Find car meets and cars & coffee events near you on Wheeloh: search by city or type of car, check in, see who's going and share the photos.",
    crumb: "Car meets",
    h1: "Car meets",
    subtitle: "near you.",
    intro:
      "Wheeloh's Car Meets tab lists the meets around you — cars & coffee, brand gatherings, Sunday-morning drives — on the map and in search. Check in, see who's going, and add your photos afterwards.",
    facts: [
      { value: "Near you", label: "meets sorted by distance" },
      { value: "Check in", label: "see who's going" },
      { value: "On the map", label: "next to the spot zones" },
      { value: "Free", label: "to find and to join" },
    ],
    showcase: "meets",
    sections: [
      {
        h2: "What is a car meet?",
        paragraphs: [
          "A car meet is a gathering of car enthusiasts in a car park, a café or a venue, usually for a few hours: owners bring their cars, everyone else comes to look, talk and take photos. Cars & coffee meets happen on weekend mornings; brand meets gather one marque; some meets are a starting point for a drive.",
          "For a spotter, a meet is the best place there is: dozens of rare cars in one spot, standing still, with owners who are happy to tell their story.",
        ],
      },
      {
        h2: "How to find a meet with Wheeloh",
        steps: [
          { title: "Open Car Meets", body: "The meets around you are listed first, under Events near you." },
          { title: "Search", body: "By city, event name or type of car — all makes, JDM only, classics…" },
          { title: "Check in", body: "Say you're going. You can see who else has checked in." },
          { title: "Share it", body: "Send the meet to friends or to your club chat, and post your photos after." },
        ],
      },
      {
        h2: "Meets on the map",
        paragraphs: [
          "Meets also show up on the garage map, next to your spots and the community's spot zones, the heat map of where cars are spotted most. Plan a weekend around the busiest areas, then drop by the meet on the way.",
        ],
      },
      {
        h2: "Organise or add a meet",
        list: [
          "**Know a meet that isn't listed?** Request it in the app: the Wheeloh team reviews every request before publishing.",
          "**Run a club?** [Communities](/car-clubs) can publish their own meets, with check-in, straight to their members.",
          "**Regular event?** A meet can have recurring dates, so members always see the next one.",
        ],
      },
      {
        h2: "Car meet etiquette",
        list: [
          "Arrive and leave calmly: no burnouts, no revving, no racing out of the car park.",
          "Ask before touching a car or opening a door.",
          "Respect the venue and the neighbours, and take your rubbish with you.",
          "Follow the organisers — they are the reason the meet can happen again.",
          "Posting photos? Wheeloh [erases the plates](/license-plate-blur) before they are uploaded.",
        ],
      },
    ],
    faq: [
      {
        question: "How do I find car meets near me?",
        answer:
          "Open the Car Meets tab in Wheeloh: the meets around you are listed first, and you can search by city, event or type of car. Meets also appear on the map.",
      },
      {
        question: "Is it free to join a meet on Wheeloh?",
        answer: "Finding and checking in to a meet on Wheeloh is free. Entry to the event itself is set by its organiser.",
      },
      {
        question: "How do I add my car meet to Wheeloh?",
        answer: "Request it from the Car Meets tab with its name, city, address and description; the team reviews it before it goes live. Clubs can publish meets directly.",
      },
      {
        question: "What is cars and coffee?",
        answer: "A relaxed morning car meet, usually at a café or car park on a weekend, where owners show their cars and enthusiasts come to look and chat.",
      },
    ],
    cta: { title: "See what's on this weekend.", body: "Free on iPhone and Android. The meets near you are one tab away." },
    related: ["clubs", "carSpotting", "plates", "cars"],
  },
  fr: {
    title: "Rasso voiture : les rassemblements auto près de chez toi",
    description:
      "Trouve les rassos auto près de chez toi sur Wheeloh : recherche par ville ou type de voiture, inscris-toi, vois qui vient et partage les photos.",
    crumb: "Rassos auto",
    h1: "Les rassos",
    subtitle: "près de chez toi.",
    intro:
      "L'onglet Rasso auto de Wheeloh liste les rassemblements autour de toi — cars & coffee, rassos de marque, balades du dimanche matin — sur la carte et dans la recherche. Inscris-toi, vois qui vient, et ajoute tes photos après.",
    facts: [
      { value: "Autour de toi", label: "rassos classés par distance" },
      { value: "Inscription", label: "vois qui participe" },
      { value: "Sur la carte", label: "à côté des zones de spots" },
      { value: "Gratuit", label: "pour trouver et participer" },
    ],
    showcase: "meets",
    sections: [
      {
        h2: "C'est quoi un rasso ?",
        paragraphs: [
          "Un rasso, c'est un rassemblement de passionnés d'automobile sur un parking, devant un café ou dans un lieu dédié, souvent pour quelques heures : les propriétaires viennent avec leur voiture, les autres viennent regarder, discuter et prendre des photos. Les cars & coffee ont lieu le week-end en matinée ; les rassos de marque réunissent un seul constructeur ; certains servent de point de départ à une balade.",
          "Pour un spotter, c'est le meilleur endroit qui soit : des dizaines de voitures rares au même endroit, à l'arrêt, avec des propriétaires ravis de raconter leur histoire.",
        ],
      },
      {
        h2: "Trouver un rasso avec Wheeloh",
        steps: [
          { title: "Ouvre Rasso auto", body: "Les rassos autour de toi s'affichent en premier." },
          { title: "Cherche", body: "Par ville, nom d'événement ou type de voiture — toutes marques, JDM uniquement, anciennes…" },
          { title: "Inscris-toi", body: "Indique que tu viens. Tu vois aussi qui d'autre s'est inscrit." },
          { title: "Partage-le", body: "Envoie le rasso à tes amis ou dans le chat de ton club, et publie tes photos après." },
        ],
      },
      {
        h2: "Les rassos sur la carte",
        paragraphs: [
          "Les rassos apparaissent aussi sur la carte du garage, à côté de tes spots et des zones de spots de la communauté, la heatmap des endroits où l'on spotte le plus. Prévois ton week-end autour des zones les plus actives, puis passe au rasso en chemin.",
        ],
      },
      {
        h2: "Organiser ou ajouter un rasso",
        list: [
          "**Tu connais un rasso qui n'est pas listé ?** Propose-le dans l'app : l'équipe Wheeloh vérifie chaque demande avant de la publier.",
          "**Tu gères un club ?** Les [communautés](/fr/clubs-auto) peuvent publier leurs propres rassos, avec inscription, directement à leurs membres.",
          "**Un événement régulier ?** Un rasso peut avoir des dates récurrentes : les membres voient toujours le prochain.",
        ],
      },
      {
        h2: "Les règles d'un bon rasso",
        list: [
          "Arrive et repars calmement : pas de burn, pas de rupteur, pas de départ arraché du parking.",
          "Demande avant de toucher une voiture ou d'ouvrir une portière.",
          "Respecte le lieu et les riverains, et repars avec tes déchets.",
          "Écoute les organisateurs : c'est grâce à eux que le rasso pourra revenir.",
          "Tu publies des photos ? Wheeloh [efface les plaques](/fr/flouter-plaque-immatriculation) avant l'envoi.",
        ],
      },
    ],
    faq: [
      {
        question: "Comment trouver un rasso voiture près de chez moi ?",
        answer:
          "Ouvre l'onglet Rasso auto de Wheeloh : les rassemblements autour de toi s'affichent en premier, et tu peux chercher par ville, événement ou type de voiture. Ils apparaissent aussi sur la carte.",
      },
      {
        question: "Participer à un rasso via Wheeloh est-il gratuit ?",
        answer: "Trouver un rasso et s'y inscrire sur Wheeloh est gratuit. L'entrée de l'événement lui-même dépend de son organisateur.",
      },
      {
        question: "Comment ajouter mon rasso sur Wheeloh ?",
        answer: "Propose-le depuis l'onglet Rasso auto avec son nom, sa ville, son adresse et une description ; l'équipe le vérifie avant publication. Les clubs peuvent publier leurs rassos directement.",
      },
      {
        question: "C'est quoi un cars & coffee ?",
        answer: "Un rassemblement auto détendu, le week-end en matinée, sur un parking ou devant un café, où les propriétaires montrent leur voiture et où les passionnés viennent regarder et discuter.",
      },
    ],
    cta: { title: "Vois ce qui se passe ce week-end.", body: "Gratuite sur iPhone et Android. Les rassos autour de toi sont à un onglet." },
    related: ["clubs", "carSpotting", "plates", "cars"],
  },
};
