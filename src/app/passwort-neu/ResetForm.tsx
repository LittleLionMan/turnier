"use client";

import { useActionState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton } from "@/components/form-bits";
import { resetPasswordAction } from "@/app/login/actions";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { status: "idle" };

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="formular" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
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
      <div>
        <SubmitButton label="Passwort speichern" pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}
