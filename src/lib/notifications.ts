import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { registration } from "@/db/schema";
import { fullName } from "./event";
import { appUrl } from "./mail";
import type { RegistrationDetails } from "./registrations";
import { escapeHtml, sendTelegram } from "./telegram";

function activePeriod(entry: RegistrationDetails): string {
  if (entry.activeFrom === null) return "keine Angabe";
  return `${entry.activeFrom}–${entry.activeTo ?? "heute"}`;
}

export async function notifyNewRegistration(eventId: number, entry: RegistrationDetails): Promise<void> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(registration)
    .where(eq(registration.eventId, eventId));

  const lines = [
    `🆕 <b>Neue Anmeldung</b> (jetzt ${total} insgesamt)`,
    "",
    `<b>${escapeHtml(fullName(entry.firstName, entry.nickname))}</b>${entry.showPublicly ? "" : " (anonym)"}`,
    `Aktiv: ${escapeHtml(activePeriod(entry))}`,
    `Turnier: ${entry.playsTournament ? escapeHtml(entry.positions.join(", ")) : "spielt nicht mit"}`,
  ];
  if (entry.helperRoleLabels.length > 0) {
    lines.push(`Hilft als: ${escapeHtml(entry.helperRoleLabels.join(", "))}`);
  }
  lines.push("", `<a href="${appUrl("/admin")}">Zum Admin-Bereich</a>`);

  await sendTelegram(lines.join("\n"));
}
