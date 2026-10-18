import type { LocalizedDoc } from "./types";

// "Guess the car game", "devine la voiture", "quiz voiture".
export const guess: LocalizedDoc = {
  en: {
    title: "Guess the Car: A Car Photo Quiz to Play With Friends",
    description:
      "Guess the car is Wheeloh's photo game: post a spot, your friends have five tries to find the make, model and year. Free on iPhone and Android.",
    crumb: "Guess the car",
    h1: "Guess the car.",
    subtitle: "Five tries.",
    intro:
      "Post a spot with “Let them guess” switched on and your friends see a mystery car in their feed, zoomed in on a detail. They have five tries to find the make, the model and the year, and the photo zooms out a little after every miss.",
    facts: [
      { value: "5", label: "tries per car" },
      { value: "3", label: "things to find: make, model, year" },
      { value: "Real", label: "photos spotted by your friends" },
      { value: "Free", label: "in the Wheeloh app" },
    ],
    showcase: "guess",
    sections: [
      {
        h2: "How the game works",
        steps: [
          { title: "Spot a car", body: "Take the photo as usual. Wheeloh identifies the car, so the answer is known." },
          { title: "Let them guess", body: "Before posting, switch on “Let them guess”. The spot goes out as a game, the photo zoomed in on the car." },
          { title: "Five attempts", body: "Your friends tap “Guess the model” in the feed and get five attempts." },
          { title: "Zoom out, try again", body: "Each field turns green or red; a right answer stays filled in. Every attempt zooms the photo out, until all three are right." },
        ],
      },
      {
        h2: "Why it is harder than it looks",
        paragraphs: [
          "Car quizzes online use press photos: perfect light, the car's best side, the badge in plain view. A spot is a real photo taken in the street — a rear three-quarter at dusk, half a car behind a bus. Telling a 911 GT3 from a GT3 RS, or a 2019 from a 2023, comes down to a wing, a vent or a light signature.",
          "That is what makes it addictive: every guess teaches you a detail, and every detail makes you a better spotter.",
        ],
      },
      {
        h2: "Tips to win",
        list: [
          "Start with the lights: front and rear signatures change with almost every generation.",
          "Look at the wheels and the brakes — performance versions rarely share them with the base car.",
          "Wings, vents and diffusers usually separate the track versions.",
          "Use a wrong guess to narrow down the year before going for the model.",
        ],
      },
      {
        h2: "Part of the game around the game",
        paragraphs: [
          "Guessing counts towards your quests — some daily challenges ask you to play a guess in the feed — and friends can challenge you directly with a notification. Every car you photograph is also [identified and scored](/car-identifier), so the quiz never runs out of cars.",
        ],
      },
    ],
    faq: [
      {
        question: "Is there a game to guess cars from photos?",
        answer: "Yes. In Wheeloh, friends post real spots as challenges and you have five tries to find the make, model and year.",
      },
      {
        question: "Who can play my guess?",
        answer: "You choose when posting: everyone, or friends only. You can also challenge a friend directly, and follow every game in the post's stats.",
      },
      {
        question: "Is Guess the car free?",
        answer: "Yes. It is part of the free Wheeloh app on iPhone and Android.",
      },
    ],
    cta: { title: "Challenge your friends.", body: "Free on iPhone and Android. Your next spot can be their next puzzle." },
    related: ["identify", "carSpotting", "cars", "clubs"],
  },
  fr: {
    title: "Devine la voiture : le quiz photo auto entre amis",
    description:
      "Devine la caisse, le jeu photo de Wheeloh : tes amis ont cinq essais pour trouver la marque, le modèle et l'année d'un spot. Gratuit sur iOS et Android.",
    crumb: "Devine la caisse",
    h1: "Devine la caisse.",
    subtitle: "Cinq essais.",
    intro:
      "Publie un spot avec « Faire deviner » activé : tes amis voient une voiture mystère dans leur feed, zoomée sur un détail. Ils ont cinq essais pour trouver la marque, le modèle et l'année, et la photo se dézoome un peu à chaque erreur.",
    facts: [
      { value: "5", label: "essais par voiture" },
      { value: "3", label: "choses à trouver : marque, modèle, année" },
      { value: "Des vraies", label: "photos spottées par tes amis" },
      { value: "Gratuit", label: "dans l'app Wheeloh" },
    ],
    showcase: "guess",
    sections: [
      {
        h2: "Comment se joue Devine la caisse",
        steps: [
          { title: "Spotte une voiture", body: "Prends la photo comme d'habitude. Wheeloh identifie la voiture : la réponse est connue." },
          { title: "Fais deviner", body: "Avant de publier, active « Faire deviner ». Le spot part comme un jeu, la photo zoomée sur la voiture." },
          { title: "Cinq essais", body: "Tes amis touchent « Deviner le modèle » dans le feed et ont cinq essais." },
          { title: "Dézoome, réessaie", body: "Chaque champ passe au vert ou au rouge ; une bonne réponse reste remplie. Chaque essai dézoome la photo, jusqu'à trouver les trois." },
        ],
      },
      {
        h2: "Plus dur qu'il n'y paraît",
        paragraphs: [
          "Les quiz auto en ligne utilisent des photos de presse : lumière parfaite, meilleur profil, logo bien visible. Un spot, c'est une vraie photo prise dans la rue — un trois-quarts arrière à la tombée de la nuit, une moitié de voiture derrière un bus. Distinguer une 911 GT3 d'une GT3 RS, ou une 2019 d'une 2023, se joue sur un aileron, une prise d'air ou une signature lumineuse.",
          "C'est ce qui rend le jeu addictif : chaque essai t'apprend un détail, et chaque détail fait de toi un meilleur spotter.",
        ],
      },
      {
        h2: "Conseils pour gagner",
        list: [
          "Commence par les feux : les signatures lumineuses changent à presque chaque génération.",
          "Regarde les jantes et les freins — les versions sportives les partagent rarement avec le modèle de base.",
          "Ailerons, prises d'air et diffuseurs trahissent souvent les versions piste.",
          "Sers-toi d'un mauvais essai pour cerner l'année avant de viser le modèle.",
        ],
      },
      {
        h2: "Un jeu dans le jeu",
        paragraphs: [
          "Jouer compte pour tes quêtes — certains défis quotidiens te demandent de participer à une devinette dans le feed — et tes amis peuvent te défier directement par notification. Chaque voiture photographiée est aussi [identifiée et notée](/fr/identifier-une-voiture) : le quiz ne manque jamais de voitures.",
        ],
      },
    ],
    faq: [
      {
        question: "Existe-t-il un jeu pour deviner des voitures en photo ?",
        answer: "Oui. Dans Wheeloh, tes amis publient de vrais spots en défi et tu as cinq essais pour trouver la marque, le modèle et l'année.",
      },
      {
        question: "Qui peut jouer à ma devinette ?",
        answer: "Tu choisis en publiant : tout le monde, ou tes amis seulement. Tu peux aussi défier un ami directement, et suivre chaque partie dans les stats du post.",
      },
      {
        question: "Devine la caisse est-il gratuit ?",
        answer: "Oui. Le jeu fait partie de l'app Wheeloh, gratuite sur iPhone et Android.",
      },
    ],
    cta: { title: "Défie tes amis.", body: "Gratuite sur iPhone et Android. Ton prochain spot peut être leur prochaine énigme." },
    related: ["identify", "carSpotting", "cars", "clubs"],
  },
};
