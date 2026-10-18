import type { LocalizedDoc } from "./types";

// "Car club app", "club auto", "communauté automobile".
export const clubs: LocalizedDoc = {
  en: {
    title: "Car Clubs & Communities: Start or Join a Car Club",
    description:
      "Create or join a car club on Wheeloh: channels, meets, polls, news and shared albums around a brand, a city or a style. Free on iPhone and Android.",
    crumb: "Car clubs",
    h1: "Car clubs",
    subtitle: "for every scene.",
    intro:
      "A Wheeloh community is a club for your friends, your city or your favourite brand: channels to chat, meets with check-in, polls, news and shared albums. You create it, you run it, and it lives right next to your spots.",
    facts: [
      { value: "Brand, city, style", label: "what a club gathers around" },
      { value: "Open or private", label: "and who can join" },
      { value: "Roles", label: "and per-channel permissions" },
      { value: "Free", label: "to create and to join" },
    ],
    showcase: "clubs",
    sections: [
      {
        h2: "What you can do in a club",
        list: [
          "**Channels** — real-time chat rooms, with replies, reactions, mentions, images, GIFs and pinned messages. An announcements channel for the admins.",
          "**Meets** — publish a meet with check-in; members see it in the club and on their map. [More on car meets](/car-meets).",
          "**News** — full articles with titles, lists, images and links, shown as a card in the feed.",
          "**Polls** — ask the club anything, from the next meet's location to the best V8.",
          "**Posts and albums** — publish photos as the club; members can show club albums in their own garage.",
        ],
      },
      {
        h2: "Start a club in a few steps",
        steps: [
          { title: "Identity", body: "A name, an avatar and a banner — the first things members see." },
          { title: "About", body: "One line for suggestions, the full story for the public page, and an optional brand." },
          { title: "Place", body: "An optional location, so spotters nearby are suggested your club." },
          { title: "Access", body: "Public or private, open, by request or invite only, plus the rules members accept." },
        ],
      },
      {
        h2: "Clubs that keep their spirit",
        paragraphs: [
          "A Porsche club full of people who have never spotted a Porsche isn't much of a Porsche club. Brand clubs can set **garage requirements**: a minimum number of that brand's cars in a member's Wheeloh collection, or a minimum share of their garage.",
          "Admins hand out custom roles with their own permissions, set channel-by-channel exceptions, mute or ban, and use a slow mode when a channel gets busy. An analytics view shows how the club's news, polls, posts and albums perform.",
        ],
      },
      {
        h2: "Find the right club",
        paragraphs: [
          "Browse communities by name, city, brand or tag, and get suggestions based on where you are and what's in your garage. Open clubs also feed Wheeloh's public feed, so their best posts reach every spotter.",
        ],
      },
    ],
    faq: [
      {
        question: "Is there an app to create a car club?",
        answer: "Yes. Wheeloh lets you create a car club with channels, meets, polls, news and shared albums, for free on iPhone and Android.",
      },
      {
        question: "Can a car club be private?",
        answer: "Yes. A private community is hidden from search and suggestions; people join with a link or an invite code.",
      },
      {
        question: "Can I limit a brand club to real owners or spotters of that brand?",
        answer: "Yes. Garage requirements can ask for a minimum number of the brand's cars in a member's Wheeloh collection, or a minimum share of their garage.",
      },
    ],
    cta: { title: "Bring your crew to Wheeloh.", body: "Free on iPhone and Android. Your club is a few taps away." },
    related: ["meets", "carSpotting", "guess", "plates"],
  },
  fr: {
    title: "Club auto : crée ou rejoins une communauté automobile",
    description:
      "Crée ou rejoins un club auto sur Wheeloh : salons, rassos, sondages, actus et albums partagés autour d'une marque, d'une ville ou d'un style. Gratuit.",
    crumb: "Clubs auto",
    h1: "Les clubs auto",
    subtitle: "pour chaque scène.",
    intro:
      "Une communauté Wheeloh, c'est un club pour tes amis, ta ville ou ta marque préférée : des salons pour discuter, des rassos avec inscription, des sondages, des actus et des albums partagés. Tu la crées, tu l'animes, et elle vit juste à côté de tes spots.",
    facts: [
      { value: "Marque, ville, style", label: "ce qui réunit un club" },
      { value: "Ouvert ou privé", label: "et qui peut le rejoindre" },
      { value: "Rôles", label: "et permissions par salon" },
      { value: "Gratuit", label: "pour créer et rejoindre" },
    ],
    showcase: "clubs",
    sections: [
      {
        h2: "Ce que tu peux faire dans un club",
        list: [
          "**Des salons** — des discussions en temps réel, avec réponses, réactions, mentions, images, GIF et messages épinglés. Un salon d'annonces pour les admins.",
          "**Des rassos** — publie un rassemblement avec inscription ; les membres le voient dans le club et sur leur carte. [Tout sur les rassos](/fr/rasso-voiture).",
          "**Des actus** — de vrais articles avec titres, listes, images et liens, présentés en carte dans le feed.",
          "**Des sondages** — demande tout au club, du lieu du prochain rasso au meilleur V8.",
          "**Des posts et des albums** — publie des photos au nom du club ; les membres peuvent afficher les albums du club dans leur propre garage.",
        ],
      },
      {
        h2: "Crée ton club en quelques étapes",
        steps: [
          { title: "Identité", body: "Un nom, un avatar et une bannière — ce que les membres voient en premier." },
          { title: "À propos", body: "Une ligne pour les suggestions, l'histoire complète pour la page publique, et une marque si tu veux." },
          { title: "Lieu", body: "Une position facultative, pour que les spotters du coin se voient proposer ton club." },
          { title: "Accès", body: "Public ou privé, ouvert, sur demande ou sur invitation, avec les règles que les membres acceptent." },
        ],
      },
      {
        h2: "Des clubs qui gardent leur esprit",
        paragraphs: [
          "Un club Porsche plein de gens qui n'ont jamais spotté de Porsche, ce n'est pas vraiment un club Porsche. Les clubs de marque peuvent fixer des **critères garage** : un nombre minimum de voitures de la marque dans la collection Wheeloh du membre, ou une part minimum de son garage.",
          "Les admins créent des rôles sur mesure avec leurs propres permissions, ajoutent des exceptions salon par salon, rendent muet ou bannissent, et activent un mode lent quand un salon s'emballe. Des statistiques montrent comment marchent les actus, sondages, posts et albums du club.",
        ],
      },
      {
        h2: "Trouve le bon club",
        paragraphs: [
          "Parcours les communautés par nom, ville, marque ou tag, et reçois des suggestions selon l'endroit où tu es et ce qu'il y a dans ton garage. Les clubs ouverts alimentent aussi le feed public de Wheeloh : leurs meilleurs posts touchent tous les spotters.",
        ],
      },
    ],
    faq: [
      {
        question: "Existe-t-il une application pour créer un club auto ?",
        answer: "Oui. Wheeloh permet de créer un club auto avec salons, rassos, sondages, actus et albums partagés, gratuitement sur iPhone et Android.",
      },
      {
        question: "Un club auto peut-il être privé ?",
        answer: "Oui. Une communauté privée n'apparaît ni dans la recherche ni dans les suggestions ; on la rejoint par lien ou code d'invitation.",
      },
      {
        question: "Peut-on réserver un club de marque aux vrais passionnés de cette marque ?",
        answer: "Oui. Les critères garage peuvent exiger un nombre minimum de voitures de la marque dans la collection Wheeloh du membre, ou une part minimum de son garage.",
      },
    ],
    cta: { title: "Amène ta bande sur Wheeloh.", body: "Gratuite sur iPhone et Android. Ton club est à quelques taps." },
    related: ["meets", "carSpotting", "guess", "plates"],
  },
};
