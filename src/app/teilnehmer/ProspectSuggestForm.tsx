"use client";

import { useActionState, useState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import { sameName, similarNames, type KnownName } from "@/lib/names";
import type { FormState } from "@/lib/validation";
import { suggestProspectAction } from "./actions";
import styles from "./page.module.css";

const SOURCE_LABELS: Record<KnownName["source"], string> = {
  liste: "auf der Liste",
  angemeldet: "schon angemeldet",
};

export function ProspectSuggestForm({ knownNames, isAdmin }: { knownNames: KnownName[]; isAdmin: boolean }) {
  const [name, setName] = useState("");
  const [state, formAction] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await suggestProspectAction(previous, formData);
    if (result.status === "success") setName("");
    return result;
  }, { status: "idle" } satisfies FormState);
  const errors = state.fieldErrors;
  const similar = similarNames(name, knownNames);
  const exact = similar.find((entry) => sameName(entry.name, name));

  return (
    <form action={formAction} className="teil" noValidate>
      <FormMessage state={state} />
      <div className="feld">
        <label htmlFor="prospect-name">Name</label>
        <input
          id="prospect-name"
          name="name"
          type="text"
          maxLength={60}
          autoComplete="off"
          placeholder="z. B. Thomas M. oder „Kalle“"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-describedby="prospect-name-hilfe"
          {...invalidProps(errors, "name", "prospect-")}
        />
        <FieldError errors={errors} name="name" idPrefix="prospect-" />
        <p className="feld-hilfe" id="prospect-name-hilfe">
          Vorname, Spitzname oder Vorname mit Anfangsbuchstaben des Nachnamens. Bitte keine vollen Nachnamen.
        </p>
        {similar.length > 0 && (
          <div className={styles.aehnlich} role="status">
            <p>{exact ? "Diesen Namen gibt es schon:" : "Meinst du vielleicht jemanden von hier?"}</p>
            <ul>
              {similar.map((entry) => (
                <li key={`${entry.source}-${entry.name}`}>
                  {entry.name} <span className="leise">({SOURCE_LABELS[entry.source]})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="feld">
        <label htmlFor="prospect-hint">Woher kennt man ihn oder sie? (optional)</label>
        <input
          id="prospect-hint"
          name="hint"
          type="text"
          maxLength={120}
          autoComplete="off"
          placeholder="z. B. 2. Herren, ca. 2005"
          defaultValue={textValue(state.values, "hint")}
          {...invalidProps(errors, "hint", "prospect-")}
        />
        <FieldError errors={errors} name="hint" idPrefix="prospect-" />
      </div>
      <SubmitButton label={isAdmin ? "Auf die Liste setzen" : "Vorschlagen"} pendingLabel="Wird gespeichert …" />
    </form>
  );
}
