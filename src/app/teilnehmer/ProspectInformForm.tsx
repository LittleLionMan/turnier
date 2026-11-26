"use client";

import { useActionState } from "react";
import { FieldError, FormMessage, SubmitButton, textValue } from "@/components/form-bits";
import { CONTACT_METHODS } from "@/lib/constants";
import type { FormState } from "@/lib/validation";
import { informProspectAction } from "./actions";
import styles from "./page.module.css";

export function ProspectInformForm({ prospectId, name }: { prospectId: number; name: string }) {
  const [state, formAction] = useActionState(informProspectAction.bind(null, prospectId), {
    status: "idle",
  } satisfies FormState);
  const errors = state.fieldErrors;
  const prefix = `info-${prospectId}-`;
  const chosen = textValue(state.values, "contactMethod");

  return (
    <details className={styles.informieren} open={state.status === "error"}>
      <summary className="knopf knopf-zweit knopf-klein">Ich habe Bescheid gesagt</summary>
      <form action={formAction} className={styles.informierenForm} noValidate>
        <FormMessage state={state} />
        <div className="feld">
          <span className="label" id={`${prefix}wie`}>
            Wie hast du {name} erreicht?
          </span>
          <div className="kacheln" role="radiogroup" aria-labelledby={`${prefix}wie`}>
            {CONTACT_METHODS.map((option) => (
              <label key={option.value} className="haken">
                <input type="radio" name="contactMethod" value={option.value} defaultChecked={chosen === option.value} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <FieldError errors={errors} name="contactMethod" idPrefix={prefix} />
        </div>
        <div className="feld">
          <label htmlFor={`${prefix}notiz`}>Notiz fürs Orga-Team (optional)</label>
          <input
            id={`${prefix}notiz`}
            name="contactNote"
            type="text"
            maxLength={200}
            placeholder="z. B. kommt wahrscheinlich, bringt seinen Bruder mit"
            defaultValue={textValue(state.values, "contactNote")}
          />
          <FieldError errors={errors} name="contactNote" idPrefix={prefix} />
        </div>
        <SubmitButton label="Als informiert markieren" pendingLabel="Wird gespeichert …" />
      </form>
    </details>
  );
}
