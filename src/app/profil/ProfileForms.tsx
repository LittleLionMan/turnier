"use client";

import { useActionState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import { ParticipationFields } from "@/components/ParticipationFields";
import type { HelperRoleOption } from "@/lib/helper-roles";
import type { FormState, RawFormValues } from "@/lib/validation";
import {
  changeEmailAction,
  changePasswordAction,
  deleteAccountAction,
  updateParticipationAction,
} from "./actions";

type ParticipationFormProps = {
  initialValues: RawFormValues;
  helperRoles: HelperRoleOption[];
  genderEnabled: boolean;
  tournamentLocked: boolean;
  isNew: boolean;
  guestFee: string | null;
};

export function ParticipationForm({
  initialValues,
  helperRoles,
  genderEnabled,
  tournamentLocked,
  isNew,
  guestFee,
}: ParticipationFormProps) {
  const [state, formAction] = useActionState(updateParticipationAction, {
    status: "idle",
    values: initialValues,
  } satisfies FormState);

  return (
    <form action={formAction} className="formular" noValidate>
      <ParticipationFields
        values={state.values}
        errors={state.fieldErrors}
        helperRoles={helperRoles}
        genderEnabled={genderEnabled}
        tournamentLocked={tournamentLocked}
        guestFee={guestFee}
      />
      <FormMessage state={state} />
      <div>
        <SubmitButton label={isNew ? "Anmeldung speichern" : "Änderungen speichern"} pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction] = useActionState(changeEmailAction, { status: "idle" } satisfies FormState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="teil" noValidate>
      <div className="feld">
        <label htmlFor="email">E-Mail-Adresse</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={textValue(state.values, "email") || currentEmail}
          {...invalidProps(errors, "email")}
        />
        <FieldError errors={errors} name="email" />
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton label="E-Mail-Adresse ändern" pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, { status: "idle" } satisfies FormState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="teil" noValidate>
      <div className="feld">
        <label htmlFor="currentPassword">Aktuelles Passwort</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          {...invalidProps(errors, "currentPassword")}
        />
        <FieldError errors={errors} name="currentPassword" />
      </div>
      <div className="zeile">
        <div className="feld">
          <label htmlFor="newPassword">Neues Passwort</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            {...invalidProps(errors, "newPassword")}
          />
          <FieldError errors={errors} name="newPassword" />
          <p className="feld-hilfe">Mindestens 8 Zeichen.</p>
        </div>
        <div className="feld">
          <label htmlFor="newPasswordConfirm">Neues Passwort wiederholen</label>
          <input
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            type="password"
            required
            autoComplete="new-password"
            {...invalidProps(errors, "newPasswordConfirm")}
          />
          <FieldError errors={errors} name="newPasswordConfirm" />
        </div>
      </div>
      <FormMessage state={state} />
      <div>
        <SubmitButton label="Passwort ändern" pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccountAction, { status: "idle" } satisfies FormState);

  return (
    <form action={formAction} className="teil">
      <p>
        Damit löschst du deine Anmeldung und dein Konto mit allen Angaben. Ein bereits gezahlter Beitrag wird nicht
        automatisch erstattet, sprich dafür bitte das Orga-Team an.
      </p>
      <label className="haken">
        <input type="checkbox" name="confirmDelete" />
        <span>Ja, ich möchte mich abmelden und mein Konto löschen.</span>
      </label>
      <FormMessage state={state} />
      <div>
        <button type="submit" className="knopf knopf-gefahr">
          Abmelden und Konto löschen
        </button>
      </div>
    </form>
  );
}
