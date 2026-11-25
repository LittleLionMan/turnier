"use server";

import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/db";
import { user, type EventRow } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  FEE_PENDING_NOTE,
  formatFee,
  getCurrentEvent,
  isPaymentActive,
  isRegistrationOpen,
  paymentCode,
} from "@/lib/event";
import { exemptionSentence, helperRoleFullMessage } from "@/lib/helper-roles";
import { appUrl, sendMail } from "@/lib/mail";
import { notifyNewRegistration } from "@/lib/notifications";
import {
  findRegistrationForUser,
  HelperRoleFullError,
  saveParticipation,
  amountDue,
  type RegistrationDetails,
} from "@/lib/registrations";
import {
  credentialsSchema,
  errorState,
  participationSchema,
  readForm,
  readGuestPreferences,
  withoutSecrets,
  type FormState,
} from "@/lib/validation";


function paymentMailLines(eventRow: EventRow, entry: RegistrationDetails): string[] {
  if (entry.paymentState === "befreit") {
    return [exemptionSentence(entry.exemptingRoleLabels)];
  }
  if (!isPaymentActive(eventRow)) return [FEE_PENDING_NOTE];

  const amount = amountDue(eventRow.feeCents, entry);
  const lines = [
    `Betrag: ${formatFee(amount.totalCents)}`,
    `Dein Verwendungszweck: ${paymentCode(entry.id)}`,
  ];
  if (entry.guestAdults > 0) {
    const guests = entry.guestAdults === 1 ? "eine erwachsene Begleitung" : `${entry.guestAdults} erwachsene Begleitpersonen`;
    lines.push(
      entry.selfExempt
        ? `${exemptionSentence(entry.exemptingRoleLabels)} Der Betrag gilt für ${guests}.`
        : `Der Betrag enthält deinen Beitrag und den für ${guests}.`,
    );
  }
  lines.push("Wie du bezahlst, steht in deinem Profil. Verbindlich dabei bist du, sobald dein Beitrag eingegangen ist.");
  return lines;
}

export async function registerAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = readForm(formData);

  if (typeof values.website === "string" && values.website.length > 0) {
    redirect("/");
  }

  const eventRow = await getCurrentEvent();
  if (!isRegistrationOpen(eventRow)) {
    return { status: "error", message: "Die Anmeldung ist leider geschlossen.", values: withoutSecrets(values) };
  }

  const credentials = credentialsSchema.safeParse(values);
  const participation = participationSchema.safeParse(values);
  if (!credentials.success || !participation.success) {
    const fieldErrors = {
      ...(credentials.success ? {} : errorState(credentials.error, values).fieldErrors),
      ...(participation.success ? {} : errorState(participation.error, values).fieldErrors),
    };
    return {
      status: "error",
      message: "Bitte prüfe die markierten Felder.",
      fieldErrors,
      values: withoutSecrets(values),
    };
  }

  let userId: string;
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email: credentials.data.email,
        password: credentials.data.password,
        name: participation.data.firstName,
      },
      headers: await headers(),
    });
    userId = result.user.id;
  } catch (error) {
    if (error instanceof APIError) {
      return {
        status: "error",
        message:
          error.body?.code === "USER_ALREADY_EXISTS" || error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? "Mit dieser E-Mail-Adresse gibt es schon eine Anmeldung. Logge dich ein, um sie zu bearbeiten."
            : "Die Anmeldung hat nicht geklappt. Bitte versuche es noch einmal.",
        values: withoutSecrets(values),
      };
    }
    throw error;
  }

  try {
    await saveParticipation(
      eventRow,
      userId,
      participation.data,
      readGuestPreferences(values, participation.data.guestAdults, participation.data.guestChildren),
    );
  } catch (error) {
    await db.delete(user).where(eq(user.id, userId));
    if (error instanceof HelperRoleFullError) {
      return {
        status: "error",
        message: "Bitte prüfe die markierten Felder.",
        fieldErrors: { helperRoleIds: [helperRoleFullMessage(error.labels)] },
        values: withoutSecrets(values),
      };
    }
    throw error;
  }

  const entry = await findRegistrationForUser(eventRow.id, userId);

  if (entry) {
    after(async () => {
      try {
        await notifyNewRegistration(eventRow.id, entry);
      } catch (error) {
        console.error("Telegram-Benachrichtigung konnte nicht gesendet werden", error);
      }
    });
  }

  try {
    await sendMail({
      to: credentials.data.email,
      subject: "Du bist angemeldet – Ehemaligenturnier SC Münster 08",
      text: [
        `Hallo ${participation.data.firstName},`,
        "",
        "schön, dass du dabei bist! Deine Anmeldung ist eingegangen.",
        "",
        ...(entry ? paymentMailLines(eventRow, entry) : []),
        "",
        `Deine Angaben kannst du jederzeit in deinem Profil ändern: ${appUrl("/profil")}`,
        "",
        "Sportliche Grüße",
        "Das Orga-Team",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Bestätigungsmail konnte nicht gesendet werden", error);
  }

  redirect("/profil?willkommen=1");
}
