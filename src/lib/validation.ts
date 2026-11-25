import { z } from "zod";
import { DRINK_OPTIONS, EARLIEST_ACTIVE_YEAR, FOOD_OPTIONS, GENDER_OPTIONS, POSITIONS } from "./constants";

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

const MULTI_VALUE_FIELDS = new Set(["positions", "helperRoleIds", "drinkChoices"]);
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
