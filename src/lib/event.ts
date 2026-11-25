import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { event, helperRole, type EventRow, type HelperRoleRow } from "@/db/schema";
import { CURRENT_EVENT_SLUG, REGISTRATION_DEADLINE_DAYS, TIME_ZONE } from "./constants";

export const getCurrentEvent = cache(async (): Promise<EventRow> => {
  const found = await db.query.event.findFirst({ where: eq(event.slug, CURRENT_EVENT_SLUG) });
  if (!found) throw new Error("Event fehlt in der Datenbank");
  return found;
});

export async function getHelperRoles(eventId: number, onlyActive: boolean): Promise<HelperRoleRow[]> {
  const roles = await db.query.helperRole.findMany({
    where: eq(helperRole.eventId, eventId),
    orderBy: [asc(helperRole.sortOrder), asc(helperRole.id)],
  });
  return onlyActive ? roles.filter((role) => role.active) : roles;
}

export function todayInBerlin(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

export function registrationDeadline(eventRow: EventRow): string | null {
  if (!eventRow.eventDate) return null;
  const deadline = new Date(`${eventRow.eventDate}T12:00:00Z`);
  deadline.setUTCDate(deadline.getUTCDate() - REGISTRATION_DEADLINE_DAYS);
  return deadline.toISOString().slice(0, 10);
}

export function isRegistrationOpen(eventRow: EventRow): boolean {
  const deadline = registrationDeadline(eventRow);
  return deadline === null || todayInBerlin() <= deadline;
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

export function formatFee(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export function isPaymentActive(eventRow: EventRow): boolean {
  return eventRow.paymentEnabled && Boolean(eventRow.paypalMeUrl);
}

export const FEE_PENDING_NOTE =
  "Für Speis und Trank werden wir euch wohl ein paar Kröten abzwacken müssen. Wie viel und wie ihr bezahlt, sagen wir euch rechtzeitig.";

export function paymentCode(registrationId: number): string {
  return `EHE-${String(registrationId).padStart(4, "0")}`;
}

export function displayName(firstName: string, nickname: string | null): string {
  return nickname ?? firstName;
}

export function fullName(firstName: string, nickname: string | null): string {
  return nickname ? `${firstName} („${nickname}“)` : firstName;
}

export type YearRange = { from: number; to: number };

export function formatYearRanges(ranges: YearRange[]): string {
  const parts = ranges.map((range) => (range.from === range.to ? String(range.from) : `${range.from}–${range.to}`));
  return new Intl.ListFormat("de-DE", { style: "long", type: "conjunction" }).format(parts);
}
