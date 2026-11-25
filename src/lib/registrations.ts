import { and, asc, count, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  helperRole,
  registration,
  registrationHelperRole,
  user,
  type EventRow,
  type FoodChoice,
  type Gender,
  type PaymentStatus,
} from "@/db/schema";
import type { ParticipationInput } from "./validation";

export type PaymentState = "offen" | "bezahlt" | "befreit";

export type RegistrationDetails = {
  id: number;
  userId: string;
  email: string;
  firstName: string;
  nickname: string | null;
  activeFrom: number | null;
  activeTo: number | null;
  showPublicly: boolean;
  playsTournament: boolean;
  positions: string[];
  gender: Gender | null;
  insuranceAccepted: boolean;
  foodChoice: FoodChoice | null;
  drinkChoices: string[];
  paymentStatus: PaymentStatus;
  paymentState: PaymentState;
  paidAt: Date | null;
  createdAt: Date;
  helperRoleIds: number[];
  helperRoleLabels: string[];
  exemptingRoleLabels: string[];
};

export class HelperRoleFullError extends Error {
  constructor(readonly labels: string[]) {
    super(`Helferrollen voll: ${labels.join(", ")}`);
  }
}

export async function saveParticipation(
  eventRow: EventRow,
  userId: string,
  input: ParticipationInput,
): Promise<number> {
  const values = {
    firstName: input.firstName,
    nickname: input.nickname,
    activeFrom: input.activeFrom,
    activeTo: input.activeTo,
    showPublicly: input.showPublicly,
    playsTournament: input.playsTournament,
    positions: input.playsTournament ? input.positions : [],
    gender: input.playsTournament && eventRow.genderEnabled ? input.gender : null,
    insuranceAccepted: input.playsTournament && input.insuranceAccepted,
    foodChoice: input.foodChoice,
    drinkChoices: [...new Set(input.drinkChoices)],
    updatedAt: new Date(),
  };

  return db.transaction(async (tx) => {
    const requestedIds = [...new Set(input.helperRoleIds)];
    const roles =
      requestedIds.length === 0
        ? []
        : await tx
            .select()
            .from(helperRole)
            .where(and(eq(helperRole.eventId, eventRow.id), inArray(helperRole.id, requestedIds)))
            .for("update");

    const alreadyChosen = await tx
      .select({ id: registrationHelperRole.helperRoleId })
      .from(registrationHelperRole)
      .innerJoin(registration, eq(registration.id, registrationHelperRole.registrationId))
      .where(and(eq(registration.eventId, eventRow.id), eq(registration.userId, userId)));
    const alreadyChosenIds = new Set(alreadyChosen.map((row) => row.id));

    const chosenRoles = roles.filter((role) => role.active || alreadyChosenIds.has(role.id));
    const limitedRoles = chosenRoles.filter((role) => role.maxCount !== null && !alreadyChosenIds.has(role.id));

    if (limitedRoles.length > 0) {
      const taken = await tx
        .select({ id: registrationHelperRole.helperRoleId, taken: count() })
        .from(registrationHelperRole)
        .innerJoin(registration, eq(registration.id, registrationHelperRole.registrationId))
        .where(
          and(
            inArray(
              registrationHelperRole.helperRoleId,
              limitedRoles.map((role) => role.id),
            ),
            ne(registration.userId, userId),
          ),
        )
        .groupBy(registrationHelperRole.helperRoleId);
      const full = limitedRoles.filter(
        (role) => (taken.find((row) => row.id === role.id)?.taken ?? 0) >= (role.maxCount ?? Infinity),
      );
      if (full.length > 0) throw new HelperRoleFullError(full.map((role) => role.label));
    }

    const [saved] = await tx
      .insert(registration)
      .values({ eventId: eventRow.id, userId, ...values })
      .onConflictDoUpdate({ target: [registration.eventId, registration.userId], set: values })
      .returning({ id: registration.id });

    await tx.delete(registrationHelperRole).where(eq(registrationHelperRole.registrationId, saved.id));
    if (chosenRoles.length > 0) {
      await tx
        .insert(registrationHelperRole)
        .values(chosenRoles.map((role) => ({ registrationId: saved.id, helperRoleId: role.id })));
    }
    return saved.id;
  });
}

export async function helperRoleOccupancy(eventId: number): Promise<Map<number, number>> {
  const rows = await db
    .select({ id: registrationHelperRole.helperRoleId, taken: count() })
    .from(registrationHelperRole)
    .innerJoin(registration, eq(registration.id, registrationHelperRole.registrationId))
    .where(eq(registration.eventId, eventId))
    .groupBy(registrationHelperRole.helperRoleId);
  return new Map(rows.map((row) => [row.id, row.taken]));
}

export async function listRegistrations(eventId: number, userId?: string): Promise<RegistrationDetails[]> {
  const rows = await db
    .select({ registration, email: user.email })
    .from(registration)
    .innerJoin(user, eq(user.id, registration.userId))
    .where(
      userId === undefined
        ? eq(registration.eventId, eventId)
        : and(eq(registration.eventId, eventId), eq(registration.userId, userId)),
    )
    .orderBy(asc(registration.createdAt));

  const ids = rows.map((row) => row.registration.id);
  const roleRows =
    ids.length === 0
      ? []
      : await db
          .select({
            registrationId: registrationHelperRole.registrationId,
            id: helperRole.id,
            label: helperRole.label,
            exemptsFromFee: helperRole.exemptsFromFee,
          })
          .from(registrationHelperRole)
          .innerJoin(helperRole, eq(helperRole.id, registrationHelperRole.helperRoleId))
          .where(inArray(registrationHelperRole.registrationId, ids))
          .orderBy(asc(helperRole.sortOrder), asc(helperRole.id));

  return rows.map(({ registration: row, email }) => {
    const roles = roleRows.filter((role) => role.registrationId === row.id);
    const exemptingRoleLabels = roles.filter((role) => role.exemptsFromFee).map((role) => role.label);
    const paymentState: PaymentState =
      row.paymentStatus === "bezahlt" ? "bezahlt" : exemptingRoleLabels.length > 0 ? "befreit" : "offen";
    return {
      id: row.id,
      userId: row.userId,
      email,
      firstName: row.firstName,
      nickname: row.nickname,
      activeFrom: row.activeFrom,
      activeTo: row.activeTo,
      showPublicly: row.showPublicly,
      playsTournament: row.playsTournament,
      positions: row.positions,
      gender: row.gender,
      insuranceAccepted: row.insuranceAccepted,
      foodChoice: row.foodChoice,
      drinkChoices: row.drinkChoices,
      paymentStatus: row.paymentStatus,
      paymentState,
      paidAt: row.paidAt,
      createdAt: row.createdAt,
      helperRoleIds: roles.map((role) => role.id),
      helperRoleLabels: roles.map((role) => role.label),
      exemptingRoleLabels,
    };
  });
}

export async function findRegistrationForUser(
  eventId: number,
  userId: string,
): Promise<RegistrationDetails | null> {
  const [entry] = await listRegistrations(eventId, userId);
  return entry ?? null;
}

export type YearCount = { year: number; count: number };

export function activeYearDistribution(entries: RegistrationDetails[], currentYear: number): YearCount[] {
  const ranges = entries
    .filter((entry) => entry.activeFrom !== null)
    .map((entry) => ({ from: entry.activeFrom ?? currentYear, to: entry.activeTo ?? currentYear }));
  if (ranges.length === 0) return [];

  const first = Math.min(...ranges.map((range) => range.from));
  const last = Math.max(...ranges.map((range) => range.to));
  const result: YearCount[] = [];
  for (let year = first; year <= last; year += 1) {
    result.push({ year, count: ranges.filter((range) => range.from <= year && year <= range.to).length });
  }
  return result;
}

export type PeakPeriods = { count: number; ranges: { from: number; to: number }[] };

export function peakPeriods(distribution: YearCount[]): PeakPeriods | null {
  const peak = Math.max(0, ...distribution.map((entry) => entry.count));
  if (peak === 0) return null;

  const ranges: { from: number; to: number }[] = [];
  for (const entry of distribution) {
    if (entry.count !== peak) continue;
    const last = ranges.at(-1);
    if (last && last.to === entry.year - 1) {
      last.to = entry.year;
    } else {
      ranges.push({ from: entry.year, to: entry.year });
    }
  }
  return { count: peak, ranges };
}
