"use client";

import { useFormStatus } from "react-dom";
import type { FieldErrors, FormState, RawFormValues } from "@/lib/validation";

type FieldErrorProps = {
  errors: FieldErrors | undefined;
  name: string;
  idPrefix?: string;
};

export function FieldError({ errors, name, idPrefix = "" }: FieldErrorProps) {
  const messages = errors?.[name];
  if (!messages || messages.length === 0) return null;
  return (
    <p className="feld-fehler" id={`${idPrefix}${name}-fehler`}>
      {messages[0]}
    </p>
  );
}

export function invalidProps(errors: FieldErrors | undefined, name: string, idPrefix = "") {
  const invalid = Boolean(errors?.[name]?.length);
  return invalid ? { "aria-invalid": true, "aria-describedby": `${idPrefix}${name}-fehler` } : {};
}

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="knopf" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const variant = state.status === "error" ? "hinweis-fehler" : "hinweis-ok";
  return (
    <div className={`hinweis ${variant}`} role={state.status === "error" ? "alert" : "status"}>
      <p>{state.message}</p>
    </div>
  );
}

export function textValue(values: RawFormValues | undefined, name: string): string {
  const value = values?.[name];
  return typeof value === "string" ? value : "";
}

export function listValue(values: RawFormValues | undefined, name: string): string[] {
  const value = values?.[name];
  return Array.isArray(value) ? value : [];
}

export function checked(values: RawFormValues | undefined, name: string): boolean {
  return values?.[name] === "on";
}
