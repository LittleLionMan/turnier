"use client";

import { useActionState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import { requestResetAction } from "@/app/login/actions";
import type { FormState } from "@/lib/validation";

const initialState: FormState = { status: "idle" };

export function RequestResetForm() {
  const [state, formAction] = useActionState(requestResetAction, initialState);
  const errors = state.fieldErrors;

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={formAction} className="formular" noValidate>
      <FormMessage state={state} />
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
      <div>
        <SubmitButton label="Link anfordern" pendingLabel="Wird gesendet …" />
      </div>
    </form>
  );
}
