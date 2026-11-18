"use client";

import Link from "next/link";
import { useActionState } from "react";
import { checked, FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import { ParticipationFields } from "@/components/ParticipationFields";
import type { HelperRoleOption } from "@/lib/helper-roles";
import type { FormState } from "@/lib/validation";
import { registerAction } from "./actions";

const initialState: FormState = { status: "idle" };

type RegisterFormProps = {
  helperRoles: HelperRoleOption[];
  genderEnabled: boolean;
};

export function RegisterForm({ helperRoles, genderEnabled }: RegisterFormProps) {
  const [state, formAction] = useActionState(registerAction, initialState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="formular" noValidate>
      <FormMessage state={state} />

      <ParticipationFields
        values={state.values}
        errors={errors}
        helperRoles={helperRoles}
        genderEnabled={genderEnabled}
        tournamentLocked={false}
      />

      <fieldset className="teil">
        <legend>Dein Zugang</legend>
        <p className="feld-hilfe">Damit loggst du dich später ein und änderst deine Angaben.</p>
        <div className="feld">
          <label htmlFor="email">E-Mail-Adresse</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={textValue(state.values, "email")}
            {...invalidProps(errors, "email")}
          />
          <FieldError errors={errors} name="email" />
        </div>
        <div className="zeile">
          <div className="feld">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              {...invalidProps(errors, "password")}
            />
            <FieldError errors={errors} name="password" />
            <p className="feld-hilfe">Mindestens 8 Zeichen.</p>
          </div>
          <div className="feld">
            <label htmlFor="passwordConfirm">Passwort wiederholen</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              autoComplete="new-password"
              {...invalidProps(errors, "passwordConfirm")}
            />
            <FieldError errors={errors} name="passwordConfirm" />
          </div>
        </div>
        <label className="haken">
          <input
            type="checkbox"
            name="privacyAccepted"
            required
            defaultChecked={checked(state.values, "privacyAccepted")}
            {...invalidProps(errors, "privacyAccepted")}
          />
          <span>
            Ich habe die{" "}
            <Link href="/datenschutz" target="_blank">
              Datenschutzerklärung
            </Link>{" "}
            gelesen und bin mit der Verarbeitung meiner Angaben einverstanden.
          </span>
        </label>
        <FieldError errors={errors} name="privacyAccepted" />
      </fieldset>

      <div className="honig" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <SubmitButton label="Verbindlich anmelden" pendingLabel="Wird gesendet …" />
      </div>
    </form>
  );
}
