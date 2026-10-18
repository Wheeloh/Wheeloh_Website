// How the guide and feature pages present each other in "related" links.
import type { Locale } from "@/lib/i18n";
import type { RouteKey } from "@/lib/routes";

export const ROUTE_CARDS: Partial<Record<RouteKey, Record<Locale, { title: string; body: string }>>> = {
  carSpotting: {
    en: { title: "What is car spotting?", body: "The hobby, where to spot, how to start and the etiquette." },
    fr: { title: "C'est quoi le carspotting ?", body: "La passion, les bons spots, comment débuter et les règles." },
  },
  identify: {
    en: { title: "Car identifier", body: "Recognise a car from a photo: make, model, version and specs." },
    fr: { title: "Identifier une voiture", body: "Reconnaître une voiture en photo : marque, modèle, version, fiche technique." },
  },
  plates: {
    en: { title: "Licence plate blur", body: "Plates erased on your phone, before anything is uploaded." },
    fr: { title: "Flouter une plaque", body: "Les plaques effacées sur ton téléphone, avant tout envoi." },
  },
  meets: {
    en: { title: "Car meets", body: "Find meets near you, check in and share them." },
    fr: { title: "Rassos auto", body: "Trouve les rassemblements près de chez toi, participe et partage." },
  },
  guess: {
    en: { title: "Guess the car", body: "Five tries to find the make, model and year." },
    fr: { title: "Devine la caisse", body: "Cinq essais pour trouver la marque, le modèle et l'année." },
  },
  clubs: {
    en: { title: "Car clubs", body: "Communities around a brand, a city or a style." },
    fr: { title: "Clubs auto", body: "Des communautés autour d'une marque, d'une ville ou d'un style." },
  },
  cars: {
    en: { title: "Cars to spot", body: "The 1,154 models of the collection, brand by brand." },
    fr: { title: "Voitures à spotter", body: "Les 1 154 modèles de la collection, marque par marque." },
  },
};
