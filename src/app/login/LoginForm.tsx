"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import type { FormState } from "@/lib/validation";
import { loginAction } from "./actions";

const initialState: FormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="formular" noValidate>
      <FormMessage state={state} />
      <fieldset className="teil">
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
        <div className="feld">
          <label htmlFor="password">Passwort</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            {...invalidProps(errors, "password")}
          />
          <FieldError errors={errors} name="password" />
          <p className="feld-hilfe">
            <Link href="/passwort-vergessen">Passwort vergessen?</Link>
          </p>
        </div>
      </fieldset>
      <div>
        <SubmitButton label="Einloggen" pendingLabel="Einen Moment …" />
      </div>
    </form>
  );
}
