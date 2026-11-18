"use client";

import { useActionState } from "react";
import { FieldError, FormMessage, invalidProps, SubmitButton, textValue } from "@/components/form-bits";
import type { FormState, RawFormValues } from "@/lib/validation";
import { addHelperRoleAction, updateEventAction, updateHelperRoleAction } from "./actions";

export function EventSettingsForm({ initialValues }: { initialValues: RawFormValues }) {
  const [state, formAction] = useActionState(updateEventAction, {
    status: "idle",
    values: initialValues,
  } satisfies FormState);
  const errors = state.fieldErrors;
  const values = state.values;

  return (
    <form action={formAction} className="teil" noValidate>
      <div className="feld">
        <label htmlFor="name">Name der Veranstaltung</label>
        <input id="name" name="name" type="text" defaultValue={textValue(values, "name")} {...invalidProps(errors, "name")} />
        <FieldError errors={errors} name="name" />
      </div>
      <div className="zeile">
        <div className="feld">
          <label htmlFor="eventDate">Datum</label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={textValue(values, "eventDate")}
            {...invalidProps(errors, "eventDate")}
          />
          <FieldError errors={errors} name="eventDate" />
          <p className="feld-hilfe">Anmeldeschluss ist automatisch zwei Wochen vorher.</p>
        </div>
        <div className="feld">
          <label htmlFor="startTime">Beginn</label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={textValue(values, "startTime")}
            {...invalidProps(errors, "startTime")}
          />
          <FieldError errors={errors} name="startTime" />
        </div>
      </div>
      <div className="feld">
        <label htmlFor="location">Ort</label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={textValue(values, "location")}
          {...invalidProps(errors, "location")}
        />
        <FieldError errors={errors} name="location" />
      </div>
      <div className="zeile">
        <div className="feld">
          <label htmlFor="fee">Teilnahmebeitrag in €</label>
          <input
            id="fee"
            name="fee"
            type="text"
            inputMode="decimal"
            defaultValue={textValue(values, "fee")}
            {...invalidProps(errors, "fee")}
          />
          <FieldError errors={errors} name="fee" />
        </div>
        <div className="feld">
          <label htmlFor="paypalMeUrl">PayPal.me-Link</label>
          <input
            id="paypalMeUrl"
            name="paypalMeUrl"
            type="url"
            placeholder="https://paypal.me/vereinskasse"
            defaultValue={textValue(values, "paypalMeUrl")}
            {...invalidProps(errors, "paypalMeUrl")}
          />
          <FieldError errors={errors} name="paypalMeUrl" />
          <p className="feld-hilfe">Ohne Link sehen Teilnehmer nur den Hinweis, dass Zahlungsinfos folgen.</p>
        </div>
      </div>
      <label className="haken">
        <input type="checkbox" name="paymentEnabled" defaultChecked={values?.paymentEnabled === "on"} />
        <span>
          <strong>Zahlung freischalten.</strong> Erst dann sehen alle Betrag, Verwendungszweck und PayPal-Button. Bis
          dahin steht auf der Seite nur, dass ein Beitrag anfällt und ihr euch dazu meldet.
        </span>
      </label>
      <label className="haken">
        <input type="checkbox" name="genderEnabled" defaultChecked={values?.genderEnabled === "on"} />
        <span>Feld „Geschlecht“ bei der Turnieranmeldung freischalten</span>
      </label>
      <FormMessage state={state} />
      <div>
        <SubmitButton label="Einstellungen speichern" pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}

function HelperRoleFields({ state, idPrefix }: { state: FormState; idPrefix: string }) {
  const errors = state.fieldErrors;
  const values = state.values;
  const id = (name: string) => `${idPrefix}${name}`;

  return (
    <>
      <div className="zeile">
        <div className="feld">
          <label htmlFor={id("label")}>Name der Rolle</label>
          <input
            id={id("label")}
            name="label"
            type="text"
            placeholder="z. B. Salat mitbringen"
            defaultValue={textValue(values, "label")}
            {...invalidProps(errors, "label", idPrefix)}
          />
          <FieldError errors={errors} name="label" idPrefix={idPrefix} />
        </div>
        <div className="feld">
          <label htmlFor={id("maxCount")}>Höchstens so viele Leute</label>
          <input
            id={id("maxCount")}
            name="maxCount"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="leer = unbegrenzt"
            defaultValue={textValue(values, "maxCount")}
            {...invalidProps(errors, "maxCount", idPrefix)}
          />
          <FieldError errors={errors} name="maxCount" idPrefix={idPrefix} />
        </div>
      </div>
      <div className="feld">
        <label htmlFor={id("description")}>Kurze Beschreibung (optional)</label>
        <input
          id={id("description")}
          name="description"
          type="text"
          defaultValue={textValue(values, "description")}
          {...invalidProps(errors, "description", idPrefix)}
        />
        <FieldError errors={errors} name="description" idPrefix={idPrefix} />
      </div>
      <label className="haken">
        <input type="checkbox" name="exemptsFromFee" defaultChecked={values?.exemptsFromFee === "on"} />
        <span>Wer diese Rolle übernimmt, zahlt keinen Teilnahmebeitrag</span>
      </label>
    </>
  );
}

export function AddHelperRoleForm() {
  const [state, formAction] = useActionState(addHelperRoleAction, { status: "idle" } satisfies FormState);

  return (
    <form action={formAction} className="teil" noValidate>
      <HelperRoleFields state={state} idPrefix="neu-" />
      <FormMessage state={state} />
      <div>
        <SubmitButton label="Rolle anlegen" pendingLabel="Wird angelegt …" />
      </div>
    </form>
  );
}

type EditHelperRoleFormProps = {
  roleId: number;
  initialValues: RawFormValues;
};

export function EditHelperRoleForm({ roleId, initialValues }: EditHelperRoleFormProps) {
  const [state, formAction] = useActionState(updateHelperRoleAction.bind(null, roleId), {
    status: "idle",
    values: initialValues,
  } satisfies FormState);

  return (
    <form action={formAction} className="teil" noValidate>
      <HelperRoleFields state={state} idPrefix={`rolle-${roleId}-`} />
      <FormMessage state={state} />
      <div>
        <SubmitButton label="Rolle speichern" pendingLabel="Wird gespeichert …" />
      </div>
    </form>
  );
}
