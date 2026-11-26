"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { contactMethodEnum, prospect } from "@/db/schema";
import { getCurrentEvent } from "@/lib/event";
import { notifyProspectInformed, notifyProspectSuggested } from "@/lib/notifications";
import { normalizeName } from "@/lib/names";
import { contactMethodLabel, findDuplicate, personName } from "@/lib/prospects";
import { isAdminEmail, requireAdmin, requireUser } from "@/lib/session";
import { errorState, readForm, type FormState } from "@/lib/validation";

function refresh(): void {
  revalidatePath("/teilnehmer");
  revalidatePath("/admin");
}

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Bitte höchstens ${maxLength} Zeichen.`)
    .optional()
    .transform((value) => value || null);
}

function notifyLater(task: () => Promise<void>): void {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error("Telegram-Benachrichtigung konnte nicht gesendet werden", error);
    }
  });
}

const suggestionSchema = z.object({
  name: z.string().trim().min(2, "Bitte gib einen Namen an.").max(60, "Bitte höchstens 60 Zeichen."),
  hint: optionalText(120),
});

export async function suggestProspectAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const currentUser = await requireUser();
  const values = readForm(formData);
  const parsed = suggestionSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const duplicate = await findDuplicate(eventRow.id, parsed.data.name);
  if (duplicate) {
    return {
      status: "error",
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors: {
        name: [
          duplicate.status === "vorgeschlagen"
            ? `„${duplicate.name}“ wurde schon vorgeschlagen und wartet auf Freigabe.`
            : `„${duplicate.name}“ steht schon auf der Liste.`,
        ],
      },
      values,
    };
  }

  const isAdmin = isAdminEmail(currentUser.email);
  await db.insert(prospect).values({
    eventId: eventRow.id,
    name: parsed.data.name,
    hint: parsed.data.hint,
    status: isAdmin ? "offen" : "vorgeschlagen",
    suggestedById: currentUser.id,
  });

  if (!isAdmin) {
    const suggestedBy = await personName(eventRow.id, currentUser.id);
    notifyLater(() => notifyProspectSuggested(parsed.data.name, parsed.data.hint, suggestedBy));
  }

  refresh();
  return {
    status: "success",
    message: isAdmin
      ? `„${parsed.data.name}“ steht jetzt auf der Liste.`
      : `Danke! „${parsed.data.name}“ erscheint auf der Liste, sobald das Orga-Team den Vorschlag freigegeben hat.`,
  };
}

export async function withdrawProspectAction(prospectId: number): Promise<void> {
  const currentUser = await requireUser();
  const eventRow = await getCurrentEvent();
  await db
    .delete(prospect)
    .where(
      and(
        eq(prospect.id, prospectId),
        eq(prospect.eventId, eventRow.id),
        eq(prospect.status, "vorgeschlagen"),
        eq(prospect.suggestedById, currentUser.id),
      ),
    );
  refresh();
}

const informationSchema = z.object({
  contactMethod: z.enum(contactMethodEnum.enumValues, { error: "Bitte wähle aus, wie du Bescheid gesagt hast." }),
  contactNote: optionalText(200),
});

export async function informProspectAction(
  prospectId: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const currentUser = await requireUser();
  const values = readForm(formData);
  const parsed = informationSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const [updated] = await db
    .update(prospect)
    .set({
      status: "informiert",
      informedById: currentUser.id,
      contactMethod: parsed.data.contactMethod,
      contactNote: parsed.data.contactNote,
      informedAt: new Date(),
    })
    .where(and(eq(prospect.id, prospectId), eq(prospect.eventId, eventRow.id), eq(prospect.status, "offen")))
    .returning({ name: prospect.name });

  if (!updated) {
    refresh();
    return { status: "error", message: "Das hat sich schon erledigt: Jemand anderes war schneller." };
  }

  const informedBy = await personName(eventRow.id, currentUser.id);
  notifyLater(() =>
    notifyProspectInformed(
      updated.name,
      informedBy,
      contactMethodLabel(parsed.data.contactMethod),
      parsed.data.contactNote,
    ),
  );

  refresh();
  return { status: "success", message: "Danke fürs Bescheidsagen!" };
}

export async function undoInformationAction(prospectId: number): Promise<void> {
  const currentUser = await requireUser();
  const eventRow = await getCurrentEvent();
  const ownOrAdmin = isAdminEmail(currentUser.email) ? undefined : eq(prospect.informedById, currentUser.id);
  await db
    .update(prospect)
    .set({ status: "offen", informedById: null, contactMethod: null, contactNote: null, informedAt: null })
    .where(
      and(
        eq(prospect.id, prospectId),
        eq(prospect.eventId, eventRow.id),
        eq(prospect.status, "informiert"),
        ownOrAdmin,
      ),
    );
  refresh();
}

export async function approveProspectAction(prospectId: number): Promise<void> {
  await requireAdmin();
  const eventRow = await getCurrentEvent();
  await db
    .update(prospect)
    .set({ status: "offen" })
    .where(and(eq(prospect.id, prospectId), eq(prospect.eventId, eventRow.id), eq(prospect.status, "vorgeschlagen")));
  refresh();
}

export async function markProspectRegisteredAction(prospectId: number): Promise<void> {
  await requireAdmin();
  const eventRow = await getCurrentEvent();
  await db
    .update(prospect)
    .set({ status: "angemeldet" })
    .where(
      and(
        eq(prospect.id, prospectId),
        eq(prospect.eventId, eventRow.id),
        or(eq(prospect.status, "offen"), eq(prospect.status, "informiert")),
      ),
    );
  refresh();
}

export async function deleteProspectAction(prospectId: number): Promise<void> {
  await requireAdmin();
  const eventRow = await getCurrentEvent();
  await db.delete(prospect).where(and(eq(prospect.id, prospectId), eq(prospect.eventId, eventRow.id)));
  refresh();
}

export async function updateProspectAction(
  prospectId: number,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = readForm(formData);
  const parsed = suggestionSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const others = await db
    .select({ id: prospect.id, name: prospect.name, hint: prospect.hint })
    .from(prospect)
    .where(eq(prospect.eventId, eventRow.id));
  const conflict = others.find(
    (entry) =>
      entry.id !== prospectId &&
      normalizeName(entry.name) === normalizeName(parsed.data.name) &&
      normalizeName(entry.hint ?? "") === normalizeName(parsed.data.hint ?? ""),
  );
  if (conflict) {
    return {
      status: "error",
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors: { hint: ["Einen Eintrag mit diesem Namen und dieser Zusatzinfo gibt es schon."] },
      values,
    };
  }

  await db
    .update(prospect)
    .set({ name: parsed.data.name, hint: parsed.data.hint })
    .where(and(eq(prospect.id, prospectId), eq(prospect.eventId, eventRow.id)));
  refresh();
  return { status: "success", message: "Gespeichert." };
}
