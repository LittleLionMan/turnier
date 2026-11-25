"use server";

import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentEvent, isRegistrationOpen } from "@/lib/event";
import { helperRoleFullMessage } from "@/lib/helper-roles";
import { findRegistrationForUser, HelperRoleFullError, saveParticipation } from "@/lib/registrations";
import { requireUser } from "@/lib/session";
import {
  emailSchema,
  errorState,
  participationSchema,
  passwordChangeSchema,
  readForm,
  readGuestPreferences,
  type FormState,
} from "@/lib/validation";

export async function updateParticipationAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const sessionUser = await requireUser();
  const values = readForm(formData);
  const parsed = participationSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  const eventRow = await getCurrentEvent();
  const existing = await findRegistrationForUser(eventRow.id, sessionUser.id);
  const open = isRegistrationOpen(eventRow);

  if (!existing && !open) {
    return { status: "error", message: "Die Anmeldung ist geschlossen.", values };
  }
  if (!open && parsed.data.playsTournament && !existing?.playsTournament) {
    return { status: "error", message: "Für das Turnier kannst du dich nicht mehr anmelden.", values };
  }

  try {
    await saveParticipation(
          eventRow,
          sessionUser.id,
          parsed.data,
          readGuestPreferences(values, parsed.data.guestAdults, parsed.data.guestChildren),
        );
  } catch (error) {
    if (error instanceof HelperRoleFullError) {
      return {
        status: "error",
        message: "Bitte prüfe die markierten Felder.",
        fieldErrors: { helperRoleIds: [helperRoleFullMessage(error.labels)] },
        values,
      };
    }
    throw error;
  }
  await db.update(user).set({ name: parsed.data.firstName }).where(eq(user.id, sessionUser.id));
  revalidatePath("/teilnehmer");
  revalidatePath("/profil");
  return { status: "success", message: "Deine Angaben sind gespeichert.", values };
}

export async function changeEmailAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const values = readForm(formData);
  const parsed = emailSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  try {
    await auth.api.changeEmail({ body: { newEmail: parsed.data.email }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        status: "error",
        message: "Diese E-Mail-Adresse kann nicht verwendet werden. Vielleicht ist sie schon vergeben?",
        values,
      };
    }
    throw error;
  }
  revalidatePath("/profil");
  return { status: "success", message: "Deine E-Mail-Adresse ist geändert. Ab jetzt loggst du dich damit ein." };
}

export async function changePasswordAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const values = readForm(formData);
  const parsed = passwordChangeSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { status: "error", message: "Das aktuelle Passwort stimmt nicht." };
    }
    throw error;
  }
  return { status: "success", message: "Dein neues Passwort ist gespeichert." };
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function deleteAccountAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const sessionUser = await requireUser();
  if (formData.get("confirmDelete") !== "on") {
    return { status: "error", message: "Bitte bestätige zuerst, dass du dich abmelden möchtest." };
  }
  await auth.api.signOut({ headers: await headers() });
  await db.delete(user).where(eq(user.id, sessionUser.id));
  revalidatePath("/teilnehmer");
  redirect("/?abgemeldet=1");
}
