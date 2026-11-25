import { z } from "zod";
import type { FoodChoice, GuestPreferences } from "@/db/schema";
import {
  DrinkChoice,
  DRINK_OPTIONS,
  EARLIEST_ACTIVE_YEAR,
  FOOD_OPTIONS,
  GENDER_OPTIONS,
  MAX_GUESTS_PER_GROUP,
  POSITIONS,
} from "./constants";

const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Bitte höchstens ${max} Zeichen.`)
    .optional()
    .transform((value) => (value ? value : null));

const optionalYear = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null;
    const year = Number(value);
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(year) || year < EARLIEST_ACTIVE_YEAR || year > currentYear) {
      ctx.addIssue({
        code: "custom",
        message: `Bitte ein Jahr zwischen ${EARLIEST_ACTIVE_YEAR} und ${currentYear}.`,
      });
      return z.NEVER;
    }
    return year;
  });

const guestCount = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return 0;
    const count = Number(value);
    if (!Number.isInteger(count) || count < 0 || count > MAX_GUESTS_PER_GROUP) {
      ctx.addIssue({ code: "custom", message: `Bitte eine Zahl zwischen 0 und ${MAX_GUESTS_PER_GROUP}.` });
      return z.NEVER;
    }
    return count;
  });

const genderValues = GENDER_OPTIONS.map((option) => option.value) as [
  (typeof GENDER_OPTIONS)[number]["value"],
  ...(typeof GENDER_OPTIONS)[number]["value"][],
];

const foodValues = FOOD_OPTIONS.map((option) => option.value) as [
  (typeof FOOD_OPTIONS)[number]["value"],
  ...(typeof FOOD_OPTIONS)[number]["value"][],
];

const drinkValues = DRINK_OPTIONS.map((option) => option.value) as [
  (typeof DRINK_OPTIONS)[number]["value"],
  ...(typeof DRINK_OPTIONS)[number]["value"][],
];

export const participationSchema = z
  .object({
    firstName: z.string().trim().min(1, "Bitte gib deinen Vornamen an.").max(50, "Bitte höchstens 50 Zeichen."),
    nickname: optionalText(50),
    activeFrom: optionalYear,
    activeTo: optionalYear,
    showPublicly: checkbox,
    playsTournament: checkbox,
    positions: z.array(z.enum(POSITIONS)).default([]),
    gender: z
      .enum(genderValues)
      .optional()
      .or(z.literal("").transform(() => undefined))
      .transform((value) => value ?? null),
    insuranceAccepted: checkbox,
    helperRoleIds: z.array(z.coerce.number().int().positive()).default([]),
    foodChoice: z
      .enum(foodValues)
      .optional()
      .transform((value) => value ?? null),
    drinkChoices: z.array(z.enum(drinkValues)).default([]),
    guestAdults: guestCount,
    guestChildren: guestCount,
  })
  .superRefine((data, ctx) => {
    if (data.activeTo !== null && data.activeFrom === null) {
      ctx.addIssue({ code: "custom", path: ["activeFrom"], message: "Bitte gib auch an, seit wann du dabei warst." });
    }
    if (data.activeFrom !== null && data.activeTo !== null && data.activeFrom > data.activeTo) {
      ctx.addIssue({ code: "custom", path: ["activeTo"], message: "Das Ende liegt vor dem Anfang." });
    }
    if (data.playsTournament && data.positions.length === 0) {
      ctx.addIssue({ code: "custom", path: ["positions"], message: "Bitte wähle mindestens eine Position." });
    }
    if (data.playsTournament && !data.insuranceAccepted) {
      ctx.addIssue({
        code: "custom",
        path: ["insuranceAccepted"],
        message: "Ohne diese Bestätigung kannst du nicht am Turnier teilnehmen.",
      });
    }
  });

export type ParticipationInput = z.output<typeof participationSchema>;

export const credentialsSchema = z
  .object({
    email: z.email("Bitte gib eine gültige E-Mail-Adresse an.").trim().toLowerCase(),
    password: z.string().min(8, "Das Passwort braucht mindestens 8 Zeichen.").max(128),
    passwordConfirm: z.string(),
    privacyAccepted: z.literal("on", { error: "Bitte stimme der Datenschutzerklärung zu." }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Die Passwörter stimmen nicht überein.",
  });

export const emailSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse an.").trim().toLowerCase(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Bitte gib dein aktuelles Passwort an."),
    newPassword: z.string().min(8, "Das Passwort braucht mindestens 8 Zeichen.").max(128),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "Die Passwörter stimmen nicht überein.",
  });

export type RawFormValues = Record<string, string | string[]>;

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: RawFormValues;
};

const MULTI_VALUE_FIELDS = new Set(["positions", "helperRoleIds", "drinkChoices", "guestDrinks"]);
const SECRET_FIELDS = new Set(["password", "passwordConfirm", "currentPassword", "newPassword", "newPasswordConfirm"]);

export function readForm(formData: FormData): RawFormValues {
  const values: RawFormValues = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const entries = formData.getAll(key).filter((entry): entry is string => typeof entry === "string");
    values[key] = MULTI_VALUE_FIELDS.has(key) ? entries : (entries[0] ?? "");
  }
  return values;
}

export function withoutSecrets(values: RawFormValues): RawFormValues {
  return Object.fromEntries(Object.entries(values).filter(([key]) => !SECRET_FIELDS.has(key)));
}

export function errorState(error: z.ZodError, values: RawFormValues): FormState {
  return {
    status: "error",
    message: "Bitte prüfe die markierten Felder.",
    fieldErrors: z.flattenError(error).fieldErrors,
    values: withoutSecrets(values),
  };
}

function isFoodChoice(value: string): value is FoodChoice {
  return FOOD_OPTIONS.some((option) => option.value === value);
}

function isDrinkChoice(value: string): value is DrinkChoice {
  return DRINK_OPTIONS.some((option) => option.value === value);
}

function single(values: RawFormValues, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}

export function adultFoodField(index: number): string {
  return `guestAdultFood_${index}`;
}

export function childFoodField(index: number): string {
  return `guestChildFood_${index}`;
}

export function guestDrinkValue(index: number, drink: DrinkChoice): string {
  return `${index}:${drink}`;
}

export function readGuestPreferences(values: RawFormValues, adults: number, children: number): GuestPreferences {
  const drinkEntries = Array.isArray(values.guestDrinks) ? values.guestDrinks : [];
  const food = (key: string) => {
    const value = single(values, key);
    return isFoodChoice(value) ? value : null;
  };

  return {
    adults: Array.from({ length: adults }, (_, index) => ({
      food: food(adultFoodField(index)),
      drinks: [
        ...new Set(
          drinkEntries
            .filter((entry) => entry.startsWith(`${index}:`))
            .map((entry) => entry.slice(entry.indexOf(":") + 1))
            .filter(isDrinkChoice),
        ),
      ],
    })),
    children: Array.from({ length: children }, (_, index) => ({ food: food(childFoodField(index)) })),
  };
}

export function guestPreferencesToForm(preferences: GuestPreferences): RawFormValues {
  const values: RawFormValues = {
    guestDrinks: preferences.adults.flatMap((guest, index) => guest.drinks.map((drink) => guestDrinkValue(index, drink))),
  };
  preferences.adults.forEach((guest, index) => {
    values[adultFoodField(index)] = guest.food ?? "";
  });
  preferences.children.forEach((guest, index) => {
    values[childFoodField(index)] = guest.food ?? "";
  });
  return values;
}
