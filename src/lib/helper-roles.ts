import type { HelperRoleRow } from "@/db/schema";
import { getHelperRoles } from "./event";
import { helperRoleOccupancy } from "./registrations";

export type HelperRoleOption = {
  id: number;
  label: string;
  description: string | null;
  exemptsFromFee: boolean;
  maxCount: number | null;
  freeSlots: number | null;
};

function toOption(role: HelperRoleRow, taken: number, chosenByUser: boolean): HelperRoleOption {
  const othersTaken = chosenByUser ? taken - 1 : taken;
  return {
    id: role.id,
    label: role.label,
    description: role.description,
    exemptsFromFee: role.exemptsFromFee,
    maxCount: role.maxCount,
    freeSlots: role.maxCount === null ? null : Math.max(0, role.maxCount - othersTaken),
  };
}

export async function helperRoleOptions(eventId: number, chosenIds: number[] = []): Promise<HelperRoleOption[]> {
  const [roles, occupancy] = await Promise.all([getHelperRoles(eventId, false), helperRoleOccupancy(eventId)]);
  const chosen = new Set(chosenIds);
  return roles
    .filter((role) => role.active || chosen.has(role.id))
    .map((role) => toOption(role, occupancy.get(role.id) ?? 0, chosen.has(role.id)));
}

export function helperRoleFullMessage(labels: string[]): string {
  const names = new Intl.ListFormat("de-DE", { type: "conjunction" }).format(labels.map((label) => `„${label}“`));
  return labels.length === 1
    ? `${names} ist inzwischen voll besetzt. Bitte nimm den Haken dort raus.`
    : `${names} sind inzwischen voll besetzt. Bitte nimm die Haken dort raus.`;
}

export function exemptionSentence(labels: string[]): string {
  const names = new Intl.ListFormat("de-DE", { type: "conjunction" }).format(labels.map((label) => `„${label}“`));
  return `Weil du dich für ${names} eingetragen hast, zahlst du keinen Teilnahmebeitrag.`;
}
