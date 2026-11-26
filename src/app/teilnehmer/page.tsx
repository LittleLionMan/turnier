import type { Metadata } from "next";
import Link from "next/link";
import { YearChart } from "@/components/YearChart";
import { displayName, formatYearRanges, getCurrentEvent } from "@/lib/event";
import { activeYearDistribution, headcount, listRegistrations, peakPeriods } from "@/lib/registrations";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Wer ist dabei?" };
export const dynamic = "force-dynamic";

function activePeriod(from: number | null, to: number | null): string {
  if (from === null) return "";
  if (to === null) return `seit ${from}`;
  return from === to ? String(from) : `${from}–${to}`;
}

function peakSentence(count: number, ranges: { from: number; to: number }[]): string {
  const single = ranges.length === 1 && ranges[0].from === ranges[0].to;
  const people = count === 1 ? "eine Person" : `${count} Leute`;
  if (single) {
    return `Am stärksten vertreten ist das Jahr ${ranges[0].from}: Da waren ${people} von uns aktiv.`;
  }
  return `Am stärksten vertreten sind die Jahre ${formatYearRanges(ranges)}: Da waren jeweils ${people} von uns aktiv.`;
}

export default async function ParticipantsPage() {
  const eventRow = await getCurrentEvent();
  const entries = await listRegistrations(eventRow.id);
  const currentYear = new Date().getFullYear();
  const distribution = activeYearDistribution(entries, currentYear);
  const players = entries.filter((entry) => entry.playsTournament).length;
  const helpers = entries.filter((entry) => entry.helperRoleIds.length > 0).length;
  const people = entries.reduce((sum, entry) => sum + headcount(entry), 0);
  const peak = peakPeriods(distribution);
  const newestFirst = [...entries].reverse();

  return (
    <div className="wrap seite">
      <h1>Wer ist dabei?</h1>

      <dl className={styles.zahlen}>
        <div>
          <dt>Anmeldungen</dt>
          <dd>{entries.length}</dd>
        </div>
        <div>
          <dt>Teilnehmer</dt>
          <dd>{people}</dd>
        </div>
        <div>
          <dt>Spielen mit</dt>
          <dd>{players}</dd>
        </div>
        <div>
          <dt>Helfen mit</dt>
          <dd>{helpers}</dd>
        </div>
      </dl>

      <section className={styles.abschnitt} aria-labelledby="jahre-titel">
        <h2 id="jahre-titel">Aus welchen Jahren kommen wir?</h2>
        {peak && <p className="lead">{peakSentence(peak.count, peak.ranges)}</p>}
        <YearChart data={distribution} />
      </section>

      <section className={styles.abschnitt} aria-labelledby="liste-titel">
        <h2 id="liste-titel">Alle Anmeldungen</h2>
        {newestFirst.length === 0 ? (
          <p className="lead">
            Noch niemand da. <Link href="/anmelden">Sei die oder der Erste.</Link>
          </p>
        ) : (
          <ul className={styles.liste}>
            {newestFirst.map((entry) => (
              <li key={entry.id} className={entry.showPublicly ? undefined : styles.anonym}>
                <span className={styles.name}>
                  {entry.showPublicly ? displayName(entry.firstName, entry.nickname) : "Anonym"}
                </span>
                <span className={styles.zeit}>
                  {entry.showPublicly ? activePeriod(entry.activeFrom, entry.activeTo) : ""}
                </span>
                <span className={styles.rollen}>
                  {entry.playsTournament && <span className="marke marke-gelb">spielt mit</span>}
                  {entry.guestAdults + entry.guestChildren > 0 && (
                    <span className="marke">+{entry.guestAdults + entry.guestChildren} Begleitung</span>
                  )}
                  {entry.helperRoleLabels.map((label) => (
                    <span key={label} className="marke">
                      {label}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
