"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { event, helperRole, registration, user } from "@/db/schema";
import { getCurrentEvent } from "@/lib/event";
import { requireAdmin } from "@/lib/session";
import { errorState, readForm, type FormState } from "@/lib/validation";

function refresh(): void {
  revalidatePath("/admin");
  revalidatePath("/teilnehmer");
  revalidatePath("/");
}

export async function setPaymentStatusAction(registrationId: number, paid: boolean): Promise<void> {
  await requireAdmin();
  await db
    .update(registration)
    .set({ paymentStatus: paid ? "bezahlt" : "offen", paidAt: paid ? new Date() : null, updatedAt: new Date() })
    .where(eq(registration.id, registrationId));
  refresh();
}

export async function deleteRegistrationAction(userId: string): Promise<void> {
  const admin = await requireAdmin();
  if (admin.id === userId) return;
  await db.delete(user).where(eq(user.id, userId));
  refresh();
}

const eventSettingsSchema = z
  .object({
    name: z.string().trim().min(1, "Bitte gib einen Namen an.").max(80),
    eventDate: z
      .string()
      .trim()
      .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Bitte ein gültiges Datum.")
      .transform((value) => value || null),
    startTime: z
      .string()
      .trim()
      .regex(/^(\d{2}:\d{2})?$/, "Bitte eine Uhrzeit wie 10:00.")
      .transform((value) => value || null),
    location: z
      .string()
      .trim()
      .max(120)
      .transform((value) => value || null),
    fee: z
      .string()
      .trim()
      .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))
      .pipe(z.number().int().min(0, "Der Beitrag kann nicht negativ sein.").max(100000)),
    paypalMeUrl: z
      .string()
      .trim()
      .transform((value) => value || null)
      .pipe(
        z
          .url({ hostname: /^(www\.)?paypal\.me$/, message: "Bitte einen Link wie https://paypal.me/name." })
          .nullable(),
      ),
    paymentEnabled: z
      .string()
      .optional()
      .transform((value) => value === "on"),
    genderEnabled: z
      .string()
      .optional()
      .transform((value) => value === "on"),
  })
  .refine((data) => !data.paymentEnabled || data.paypalMeUrl !== null, {
    path: ["paypalMeUrl"],
    message: "Zum Freischalten der Zahlung brauchen wir den PayPal.me-Link.",
  });

export async function updateEventAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = readForm(formData);
  const parsed = eventSettingsSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const { fee, ...rest } = parsed.data;
  await db
    .update(event)
    .set({ ...rest, feeCents: fee })
    .where(eq(event.id, eventRow.id));
  refresh();
  return { status: "success", message: "Gespeichert.", values };
}

const helperRoleSchema = z.object({
  label: z.string().trim().min(1, "Bitte gib einen Namen an.").max(60),
  description: z
    .string()
    .trim()
    .max(200)
    .transform((value) => value || null),
  maxCount: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) return null;
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1000) {
        ctx.addIssue({ code: "custom", message: "Bitte eine ganze Zahl ab 1 oder leer lassen." });
        return z.NEVER;
      }
      return parsed;
    }),
  exemptsFromFee: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export async function addHelperRoleAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = readForm(formData);
  const parsed = helperRoleSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const [{ highest }] = await db
    .select({ highest: max(helperRole.sortOrder) })
    .from(helperRole)
    .where(eq(helperRole.eventId, eventRow.id));
  await db.insert(helperRole).values({ eventId: eventRow.id, ...parsed.data, sortOrder: (highest ?? 0) + 1 });
  refresh();
  return { status: "success", message: `„${parsed.data.label}“ ist angelegt.` };
}

export async function updateHelperRoleAction(
  roleId: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = readForm(formData);
  const parsed = helperRoleSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  await db
    .update(helperRole)
    .set(parsed.data)
    .where(and(eq(helperRole.id, roleId), eq(helperRole.eventId, eventRow.id)));
  refresh();
  return { status: "success", message: "Gespeichert.", values };
}

export async function setHelperRoleActiveAction(roleId: number, active: boolean): Promise<void> {
  await requireAdmin();
  const eventRow = await getCurrentEvent();
  await db
    .update(helperRole)
    .set({ active })
    .where(and(eq(helperRole.id, roleId), eq(helperRole.eventId, eventRow.id)));
  refresh();
}
