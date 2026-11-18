"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { appUrl } from "@/lib/mail";
import { emailSchema, errorState, readForm, withoutSecrets, type FormState } from "@/lib/validation";

const loginSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse an.").trim().toLowerCase(),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});

const resetSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Das Passwort braucht mindestens 8 Zeichen.").max(128),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    path: ["newPasswordConfirm"],
    message: "Die Passwörter stimmen nicht überein.",
  });

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = readForm(formData);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        status: "error",
        message: "E-Mail-Adresse oder Passwort stimmen nicht.",
        values: withoutSecrets(values),
      };
    }
    throw error;
  }
  redirect("/profil");
}

export async function requestResetAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = readForm(formData);
  const parsed = emailSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: appUrl("/passwort-neu") },
      headers: await headers(),
    });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
  }

  return {
    status: "success",
    message: "Wenn es zu dieser Adresse ein Konto gibt, ist jetzt eine Mail mit einem Link unterwegs. Schau auch im Spam-Ordner nach.",
  };
}

export async function resetPasswordAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = readForm(formData);
  const parsed = resetSchema.safeParse(values);
  if (!parsed.success) return errorState(parsed.error, values);

  try {
    await auth.api.resetPassword({
      body: { token: parsed.data.token, newPassword: parsed.data.newPassword },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return {
        status: "error",
        message: "Der Link ist abgelaufen oder wurde schon benutzt. Fordere einfach einen neuen an.",
      };
    }
    throw error;
  }
  redirect("/login?passwort=neu");
}
