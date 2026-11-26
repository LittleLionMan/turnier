import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { prospect, registration, user, type ContactMethod, type ProspectStatus } from "@/db/schema";
import { CONTACT_METHODS } from "./constants";
import { displayName, fullName } from "./event";
import { sameName, type KnownName } from "./names";

export type Viewer = {
  id: string;
  isAdmin: boolean;
};

export type VisibleProspectStatus = Exclude<ProspectStatus, "angemeldet">;

export type AdminProspectDetails = {
  suggestedBy: string | null;
  informedBy: string | null;
  contactMethod: ContactMethod | null;
  contactNote: string | null;
};

export type ProspectEntry = {
  id: number;
  name: string;
  hint: string | null;
  status: VisibleProspectStatus;
  ownSuggestion: boolean;
  ownInformation: boolean;
  adminDetails: AdminProspectDetails | null;
};

const STATUS_ORDER: Record<VisibleProspectStatus, number> = { vorgeschlagen: 0, offen: 1, informiert: 2 };

export function contactMethodLabel(method: ContactMethod): string {
  return CONTACT_METHODS.find((option) => option.value === method)?.label ?? method;
}

export async function personNames(eventId: number, userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const rows = await db
    .select({
      id: user.id,
      accountName: user.name,
      firstName: registration.firstName,
      nickname: registration.nickname,
    })
    .from(user)
    .leftJoin(registration, and(eq(registration.userId, user.id), eq(registration.eventId, eventId)))
    .where(inArray(user.id, userIds));
  return new Map(
    rows.map((row) => [row.id, row.firstName !== null ? fullName(row.firstName, row.nickname) : row.accountName]),
  );
}

export async function personName(eventId: number, userId: string): Promise<string> {
  const names = await personNames(eventId, [userId]);
  return names.get(userId) ?? "Unbekannt";
}

function isVisibleStatus(status: ProspectStatus): status is VisibleProspectStatus {
  return status !== "angemeldet";
}

export async function listProspects(eventId: number, viewer: Viewer): Promise<ProspectEntry[]> {
  const rows = await db.select().from(prospect).where(eq(prospect.eventId, eventId));
  const visible = rows.flatMap((row) =>
    isVisibleStatus(row.status) && (row.status !== "vorgeschlagen" || viewer.isAdmin || row.suggestedById === viewer.id)
      ? [{ ...row, status: row.status }]
      : [],
  );

  const involved = visible.flatMap((row) => [row.suggestedById, row.informedById]);
  const names = viewer.isAdmin
    ? await personNames(eventId, [...new Set(involved)].filter((id): id is string => id !== null))
    : new Map<string, string>();
  const nameOf = (id: string | null) => (id === null ? null : (names.get(id) ?? null));

  return visible
    .map((row) => ({
      id: row.id,
      name: row.name,
      hint: row.hint,
      status: row.status,
      ownSuggestion: row.suggestedById === viewer.id,
      ownInformation: row.informedById === viewer.id,
      adminDetails: viewer.isAdmin
        ? {
            suggestedBy: nameOf(row.suggestedById),
            informedBy: nameOf(row.informedById),
            contactMethod: row.contactMethod,
            contactNote: row.contactNote,
          }
        : null,
    }))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.name.localeCompare(b.name, "de"));
}

export async function knownNames(eventId: number, prospects: ProspectEntry[], viewer: Viewer): Promise<KnownName[]> {
  const registrations = await db
    .select({
      firstName: registration.firstName,
      nickname: registration.nickname,
      showPublicly: registration.showPublicly,
    })
    .from(registration)
    .where(eq(registration.eventId, eventId));

  return [
    ...prospects.map((entry) => ({ name: entry.name, source: "liste" as const })),
    ...registrations
      .filter((entry) => viewer.isAdmin || entry.showPublicly)
      .map((entry) => ({
        name: viewer.isAdmin ? fullName(entry.firstName, entry.nickname) : displayName(entry.firstName, entry.nickname),
        source: "angemeldet" as const,
      })),
  ];
}

export async function findDuplicate(
  eventId: number,
  name: string,
): Promise<{ name: string; status: ProspectStatus } | null> {
  const rows = await db
    .select({ name: prospect.name, status: prospect.status })
    .from(prospect)
    .where(eq(prospect.eventId, eventId));
  return rows.find((row) => sameName(row.name, name)) ?? null;
}

export async function prospectCounts(eventId: number): Promise<{ recruited: number; pending: number }> {
  const rows = await db
    .select({ status: prospect.status, total: count() })
    .from(prospect)
    .where(eq(prospect.eventId, eventId))
    .groupBy(prospect.status);
  const totalFor = (status: ProspectStatus) => rows.find((row) => row.status === status)?.total ?? 0;
  return { recruited: totalFor("angemeldet"), pending: totalFor("vorgeschlagen") };
}

export async function prospectNamesAndHints(eventId: number): Promise<{ name: string; hint: string | null }[]> {
  return db.select({ name: prospect.name, hint: prospect.hint }).from(prospect).where(eq(prospect.eventId, eventId));
}
