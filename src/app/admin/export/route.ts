import { getCurrentEvent, paymentCode } from "@/lib/event";
import { listRegistrations } from "@/lib/registrations";
import { getSessionUser, isAdminEmail } from "@/lib/session";

function csvCell(value: string | number | boolean | null): string {
  if (value === null) return "";
  const text = typeof value === "boolean" ? (value ? "ja" : "nein") : String(value);
  return /[;"\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(): Promise<Response> {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !isAdminEmail(sessionUser.email)) {
    return new Response("Nicht erlaubt", { status: 403 });
  }

  const eventRow = await getCurrentEvent();
  const entries = await listRegistrations(eventRow.id);
  const header = [
    "Code",
    "Vorname",
    "Spitzname",
    "E-Mail",
    "Aktiv von",
    "Aktiv bis",
    "Öffentlich",
    "Spielt mit",
    "Positionen",
    "Geschlecht",
    "Versicherungshinweis bestätigt",
    "Helferrollen",
    "Bezahlstatus",
    "Bezahlt am",
    "Angemeldet am",
  ];
  const rows = entries.map((entry) => [
    paymentCode(entry.id),
    entry.firstName,
    entry.nickname,
    entry.email,
    entry.activeFrom,
    entry.activeTo,
    entry.showPublicly,
    entry.playsTournament,
    entry.positions.join(", "),
    entry.gender,
    entry.insuranceAccepted,
    entry.helperRoleLabels.join(", "),
    entry.paymentState,
    entry.paidAt?.toISOString() ?? null,
    entry.createdAt.toISOString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");

  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="anmeldungen-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
