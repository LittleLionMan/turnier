export const CURRENT_EVENT_SLUG = "ehemaligenturnier";

export const POSITIONS = [
  "Torwart",
  "Linksaußen",
  "Rückraum links",
  "Rückraum Mitte",
  "Rückraum rechts",
  "Rechtsaußen",
  "Kreis",
  "Nur Abwehr",
] as const;

export type Position = (typeof POSITIONS)[number];

export const GENDER_OPTIONS = [
  { value: "weiblich", label: "weiblich" },
  { value: "maennlich", label: "männlich" },
  { value: "divers", label: "divers" },
] as const;

export const FOOD_OPTIONS = [
  { value: "fleisch", label: "Fleisch" },
  { value: "vegetarisch", label: "Vegetarisch" },
  { value: "vegan", label: "Vegan" },
] as const;

export const DRINK_OPTIONS = [
  { value: "bier", label: "Bier" },
  { value: "spritz", label: "Spritzgetränke" },
  { value: "wein", label: "Wein" },
  { value: "alkoholfrei", label: "Alkoholfrei" },
] as const;

export const CONTACT_METHODS = [
  { value: "anruf", label: "Angerufen" },
  { value: "nachricht", label: "WhatsApp/Nachricht" },
  { value: "persoenlich", label: "Persönlich" },
  { value: "social_media", label: "Social Media" },
] as const;

export type DrinkChoice = (typeof DRINK_OPTIONS)[number]["value"];

export const DEFAULT_FOOD = "fleisch";
export const DEFAULT_DRINKS: DrinkChoice[] = ["bier"];

export const REGISTRATION_DEADLINE_DAYS = 14;
export const EARLIEST_ACTIVE_YEAR = 1950;
export const TIME_ZONE = "Europe/Berlin";

export const MAX_GUESTS_PER_GROUP = 10;
