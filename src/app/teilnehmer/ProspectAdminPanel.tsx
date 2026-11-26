"use client";

import { useActionState, useState, type ReactNode } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import type { FormState } from "@/lib/validation";
import { updateProspectAction } from "./actions";
import styles from "./page.module.css";

type ProspectAdminPanelProps = {
  prospectId: number;
  name: string;
  hint: string | null;
  children?: ReactNode;
};

export function ProspectAdminPanel({ prospectId, name, hint, children }: ProspectAdminPanelProps) {
  const [round, setRound] = useState(0);
  const [state, formAction] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await updateProspectAction(prospectId, previous, formData);
    if (result.status === "success") setRound((value) => value + 1);
    return result;
  }, { status: "idle" } satisfies FormState);
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const values = state.status === "error" ? state.values : undefined;
  const prefix = `edit-${prospectId}-`;

  return (
    <details key={round} className={styles.verwalten} open={state.status === "error"}>
      <summary>Verwalten</summary>
      <div className={styles.panel}>
        <form action={formAction} className={styles.panelForm} noValidate>
          {state.status === "error" && <FormMessage state={state} />}
          <div className="feld">
            <label htmlFor={`${prefix}name`}>Name</label>
            <input
              id={`${prefix}name`}
              name="name"
              type="text"
              maxLength={60}
              autoComplete="off"
              defaultValue={values ? textValue(values, "name") : name}
              {...invalidProps(errors, "name", prefix)}
            />
            <FieldError errors={errors} name="name" idPrefix={prefix} />
          </div>
          <div className="feld">
            <label htmlFor={`${prefix}hint`}>Zusatzinfo</label>
            <input
              id={`${prefix}hint`}
              name="hint"
              type="text"
              maxLength={120}
              autoComplete="off"
              placeholder="z. B. Torwart 2014"
              defaultValue={values ? textValue(values, "hint") : (hint ?? "")}
              {...invalidProps(errors, "hint", prefix)}
            />
            <FieldError errors={errors} name="hint" idPrefix={prefix} />
          </div>
          <SubmitButton label="Änderungen speichern" pendingLabel="Wird gespeichert …" />
        </form>
        {children && <div className={styles.panelAktionen}>{children}</div>}
      </div>
    </details>
  );
}
