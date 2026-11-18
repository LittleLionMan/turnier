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

export const REGISTRATION_DEADLINE_DAYS = 14;
export const EARLIEST_ACTIVE_YEAR = 1950;
export const TIME_ZONE = "Europe/Berlin";
