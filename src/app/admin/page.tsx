import type { Metadata } from "next";
import Link from "next/link";
import { POSITIONS } from "@/lib/constants";
import { formatFee, fullName, getCurrentEvent, getHelperRoles, paymentCode } from "@/lib/event";
import { listPhotos } from "@/lib/photos";
import { listRegistrations, type PaymentState } from "@/lib/registrations";
import { requireAdmin } from "@/lib/session";
import { deleteRegistrationAction, setHelperRoleActiveAction, setPaymentStatusAction } from "./actions";
import { AddHelperRoleForm, EditHelperRoleForm, EventSettingsForm } from "./AdminForms";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

type Filter = "alle" | PaymentState;

const FILTER_LABELS: Record<Filter, string> = {
  alle: "Alle",
  offen: "Beitrag offen",
  bezahlt: "Bezahlt",
  befreit: "Beitragsfrei",
};

type AdminPageProps = {
  searchParams: Promise<{ status?: string }>;
};

const dateFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeZone: "Europe/Berlin" });

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const admin = await requireAdmin();
  const { status } = await searchParams;
  const filter: Filter = status === "offen" || status === "bezahlt" || status === "befreit" ? status : "alle";

  const eventRow = await getCurrentEvent();
  const [entries, helperRoles, photos] = await Promise.all([
    listRegistrations(eventRow.id),
    getHelperRoles(eventRow.id, false),
    listPhotos(),
  ]);
  const paid = entries.filter((entry) => entry.paymentState === "bezahlt");
  const exempt = entries.filter((entry) => entry.paymentState === "befreit");
  const open = entries.filter((entry) => entry.paymentState === "offen");
  const visible = filter === "alle" ? entries : entries.filter((entry) => entry.paymentState === filter);
  const players = entries.filter((entry) => entry.playsTournament);

  return (
    <div className="wrap seite">
      <h1>Admin</h1>

      <section className={styles.abschnitt} aria-labelledby="ueberblick-titel">
        <h2 id="ueberblick-titel">Überblick</h2>
        <dl className={styles.zahlen}>
          <div>
            <dt>Anmeldungen</dt>
            <dd>{entries.length}</dd>
          </div>
          <div>
            <dt>Bezahlt</dt>
            <dd>{paid.length}</dd>
          </div>
          <div>
            <dt>Beitragsfrei</dt>
            <dd>{exempt.length}</dd>
          </div>
          <div>
            <dt>Offen</dt>
            <dd>{open.length}</dd>
          </div>
          <div>
            <dt>Eingenommen</dt>
            <dd>{formatFee(paid.length * eventRow.feeCents)}</dd>
          </div>
        </dl>
        <div className={styles.verteilung}>
          <div>
            <h3>Spieler nach Position ({players.length})</h3>
            <ul>
              {POSITIONS.map((position) => (
                <li key={position}>
                  <span>{position}</span>
                  <span>{players.filter((entry) => entry.positions.includes(position)).length}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Helfer nach Rolle</h3>
            <ul>
              {helperRoles.map((role) => (
                <li key={role.id}>
                  <span>{role.label}</span>
                  <span>{entries.filter((entry) => entry.helperRoleIds.includes(role.id)).length}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.abschnitt} aria-labelledby="anmeldungen-titel">
        <div className={styles.kopfzeile}>
          <h2 id="anmeldungen-titel">Anmeldungen</h2>
          <a href="/admin/export" className="knopf knopf-zweit knopf-klein">
            Als CSV herunterladen
          </a>
        </div>
        <nav className={styles.filter} aria-label="Nach Bezahlstatus filtern">
          {(["alle", "offen", "bezahlt", "befreit"] as const).map((option) => (
            <Link
              key={option}
              href={option === "alle" ? "/admin" : `/admin?status=${option}`}
              aria-current={filter === option ? "page" : undefined}
            >
              {FILTER_LABELS[option]}
            </Link>
          ))}
        </nav>
        <div className={styles.scroller}>
          <table className={`tabelle ${styles.karten}`}>
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Name</th>
                <th scope="col">E-Mail</th>
                <th scope="col">Aktiv</th>
                <th scope="col">Turnier</th>
                <th scope="col">Hilft als</th>
                <th scope="col">Angemeldet</th>
                <th scope="col">Beitrag</th>
                <th scope="col">
                  <span className="visually-hidden">Entfernen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Code" className={styles.code}>{paymentCode(entry.id)}</td>
                  <td data-label="Name">
                    {fullName(entry.firstName, entry.nickname)}
                    {!entry.showPublicly && <span className="leise"> (anonym)</span>}
                  </td>
                  <td data-label="E-Mail">
                    <a href={`mailto:${entry.email}`}>{entry.email}</a>
                  </td>
                  <td data-label="Aktiv">
                    {entry.activeFrom ?? ""}
                    {entry.activeFrom !== null ? `–${entry.activeTo ?? "heute"}` : ""}
                  </td>
                  <td data-label="Turnier">{entry.playsTournament ? entry.positions.join(", ") : "–"}</td>
                  <td data-label="Hilft als">{entry.helperRoleLabels.join(", ") || "–"}</td>
                  <td data-label="Angemeldet">{dateFormat.format(entry.createdAt)}</td>
                  <td data-label="Beitrag">
                    {entry.paymentState === "befreit" ? (
                      <span className="marke marke-gruen" title={entry.exemptingRoleLabels.join(", ")}>
                        Beitragsfrei
                      </span>
                    ) : (
                      <form action={setPaymentStatusAction.bind(null, entry.id, entry.paymentState !== "bezahlt")}>
                        <button
                          type="submit"
                          className={`marke ${entry.paymentState === "bezahlt" ? "marke-gruen" : "marke-offen"} ${styles.statusKnopf}`}
                          title={entry.paymentState === "bezahlt" ? "Wieder auf offen setzen" : "Als bezahlt markieren"}
                        >
                          {entry.paymentState === "bezahlt" ? "Bezahlt" : "Offen – als bezahlt markieren"}
                        </button>
                      </form>
                    )}
                  </td>
                  <td className={styles.aktion}>
                    {entry.userId !== admin.id && (
                      <details className={styles.loeschen}>
                        <summary>Entfernen</summary>
                        <form action={deleteRegistrationAction.bind(null, entry.userId)}>
                          <p>Anmeldung und Konto von {entry.firstName} endgültig löschen?</p>
                          <button type="submit" className="knopf knopf-gefahr knopf-klein">
                            Endgültig löschen
                          </button>
                        </form>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <p className="leise">Keine Anmeldungen in dieser Ansicht.</p>}
        </div>
      </section>

      <section className={`${styles.abschnitt} ${styles.schmal}`} aria-labelledby="event-titel">
        <h2 id="event-titel">Veranstaltung</h2>
        <EventSettingsForm
          initialValues={{
            name: eventRow.name,
            eventDate: eventRow.eventDate ?? "",
            startTime: eventRow.startTime ?? "",
            location: eventRow.location ?? "",
            fee: (eventRow.feeCents / 100).toFixed(2).replace(".", ","),
            paypalMeUrl: eventRow.paypalMeUrl ?? "",
            paymentEnabled: eventRow.paymentEnabled ? "on" : "",
            genderEnabled: eventRow.genderEnabled ? "on" : "",
          }}
        />
      </section>

      <section className={`${styles.abschnitt} ${styles.schmal}`} aria-labelledby="rollen-titel">
        <h2 id="rollen-titel">Helferrollen</h2>
        <p className="leise">
          Ausgeblendete Rollen erscheinen nicht mehr im Formular. Bisherige Zusagen bleiben erhalten. Eine Höchstzahl gilt
          nur für neue Zusagen: Wer schon eingetragen ist, bleibt es auch, wenn ihr die Zahl verkleinert.
        </p>
        <ul className={styles.rollen}>
          {helperRoles.map((role) => {
            const taken = entries.filter((entry) => entry.helperRoleIds.includes(role.id)).length;
            return (
              <li key={role.id}>
                <div className={styles.rolleKopf}>
                  <span>
                    <strong>{role.label}</strong>
                    <span className="leise">
                      {" "}
                      – {role.maxCount === null ? `${taken} dabei` : `${taken} von ${role.maxCount} belegt`}
                      {role.exemptsFromFee && ", ohne Teilnahmebeitrag"}
                      {!role.active && ", ausgeblendet"}
                    </span>
                  </span>
                  <form action={setHelperRoleActiveAction.bind(null, role.id, !role.active)}>
                    <button type="submit" className="knopf knopf-zweit knopf-klein">
                      {role.active ? "Ausblenden" : "Einblenden"}
                    </button>
                  </form>
                </div>
                <details className={styles.rolleBearbeiten}>
                  <summary>Bearbeiten</summary>
                  <EditHelperRoleForm
                    roleId={role.id}
                    initialValues={{
                      label: role.label,
                      description: role.description ?? "",
                      maxCount: role.maxCount?.toString() ?? "",
                      exemptsFromFee: role.exemptsFromFee ? "on" : "",
                    }}
                  />
                </details>
              </li>
            );
          })}
        </ul>
        <h3>Neue Rolle</h3>
        <AddHelperRoleForm />
      </section>

      <section className={`${styles.abschnitt} ${styles.schmal}`} aria-labelledby="fotos-titel">
        <h2 id="fotos-titel">Siegerfotos</h2>
        <p>
          {photos.length === 0
            ? "Noch keine Fotos. Die Galerie auf der Startseite bleibt ausgeblendet, bis welche da sind."
            : `${photos.length} ${photos.length === 1 ? "Foto" : "Fotos"} in der Galerie auf der Startseite.`}
        </p>
        <p className="leise">
          Neue Fotos legt ihr im Ordner <code>fotos/</code> auf dem Server ab (JPG, PNG, WebP oder AVIF). Der Dateiname
          wird zur Bildunterschrift, zum Beispiel <code>2019_Stadtmeister_Herren.jpg</code>. Mit einer Nummer davor wie{" "}
          <code>01_…</code> legt ihr die Reihenfolge fest, die Nummer wird nicht angezeigt.
        </p>
      </section>
    </div>
  );
}
