import type { Metadata } from "next";
import { SharePanel } from "@/components/SharePanel";
import type { EventRow } from "@/db/schema";
import {
  FEE_PENDING_NOTE,
  formatFee,
  getCurrentEvent,
  isPaymentActive,
  isRegistrationOpen,
  paymentCode,
} from "@/lib/event";
import { exemptionSentence, helperRoleOptions } from "@/lib/helper-roles";
import { findRegistrationForUser, type RegistrationDetails } from "@/lib/registrations";
import { requireUser } from "@/lib/session";
import type { RawFormValues } from "@/lib/validation";
import { logoutAction } from "./actions";
import styles from "./page.module.css";
import { DeleteAccountForm, EmailForm, ParticipationForm, PasswordForm } from "./ProfileForms";

export const metadata: Metadata = { title: "Mein Profil" };
export const dynamic = "force-dynamic";

type ProfilePageProps = {
  searchParams: Promise<{ willkommen?: string }>;
};

function toFormValues(entry: RegistrationDetails): RawFormValues {
  const flag = (value: boolean) => (value ? "on" : "");
  return {
    firstName: entry.firstName,
    nickname: entry.nickname ?? "",
    activeFrom: entry.activeFrom?.toString() ?? "",
    activeTo: entry.activeTo?.toString() ?? "",
    showPublicly: flag(entry.showPublicly),
    playsTournament: flag(entry.playsTournament),
    positions: entry.positions,
    gender: entry.gender ?? "",
    insuranceAccepted: flag(entry.insuranceAccepted),
    helperRoleIds: entry.helperRoleIds.map(String),
    foodChoice: entry.foodChoice ?? "",
    drinkChoices: entry.drinkChoices,
  };
}

function paypalLink(baseUrl: string, cents: number): string {
  const amount = (cents / 100).toFixed(2);
  return `${baseUrl.replace(/\/+$/, "")}/${amount}EUR`;
}

function PaymentStatus({ eventRow, entry }: { eventRow: EventRow; entry: RegistrationDetails }) {
  if (entry.paymentState === "bezahlt") {
    return (
      <p className={styles.dabei}>
        <span className="marke marke-gruen">Bezahlt</span> Dein Beitrag ist da. Du bist verbindlich dabei.
      </p>
    );
  }

  if (entry.paymentState === "befreit") {
    return (
      <p className={styles.dabei}>
        <span className="marke marke-gruen">Beitragsfrei</span> {exemptionSentence(entry.exemptingRoleLabels)} Du bist
        verbindlich dabei.
      </p>
    );
  }

  if (!isPaymentActive(eventRow) || !eventRow.paypalMeUrl) {
    return (
      <p>
        <span className="marke marke-gelb">Angemeldet</span> {FEE_PENDING_NOTE}
      </p>
    );
  }

  return (
    <>
      <p>
        <span className="marke marke-offen">Beitrag offen</span> Du bist angemeldet. Verbindlich dabei bist du, sobald
        dein Beitrag von {formatFee(eventRow.feeCents)} eingegangen ist.
      </p>
      <dl className={styles.zahlung}>
        <div>
          <dt>Betrag</dt>
          <dd>{formatFee(eventRow.feeCents)}</dd>
        </div>
        <div>
          <dt>Verwendungszweck</dt>
          <dd>
            <code>{paymentCode(entry.id)}</code>
          </dd>
        </div>
      </dl>
      <p>
        <a
          className="knopf"
          href={paypalLink(eventRow.paypalMeUrl, eventRow.feeCents)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Mit PayPal bezahlen
        </a>
        <span className={`feld-hilfe ${styles.zweck}`}>
          Gib bei PayPal bitte {paymentCode(entry.id)} als Nachricht an, damit wir die Zahlung zuordnen können.
        </span>
      </p>
    </>
  );
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const sessionUser = await requireUser();
  const { willkommen } = await searchParams;
  const eventRow = await getCurrentEvent();
  const entry = await findRegistrationForUser(eventRow.id, sessionUser.id);
  const roleOptions = await helperRoleOptions(eventRow.id, entry?.helperRoleIds);
  const open = isRegistrationOpen(eventRow);

  return (
    <div className="wrap-schmal seite">
      <h1>Hallo {entry?.firstName ?? sessionUser.name}</h1>

      {willkommen && (
        <div className="hinweis hinweis-ok" role="status">
          <p>
            <strong>Du bist angemeldet.</strong> Eine Bestätigung ist per Mail unterwegs. Hier kannst du alle Angaben
            jederzeit ändern.
          </p>
        </div>
      )}

      {entry && (
        <section className={styles.status} aria-labelledby="status-titel">
          <h2 id="status-titel">Dein Status</h2>
          <PaymentStatus eventRow={eventRow} entry={entry} />
        </section>
      )}

      {entry && (
        <SharePanel
          heading="Kennst du noch Leute von früher?"
          text="Schick ihnen die Seite. Je mehr Ehemalige kommen, desto besser wird das Turnier."
        />
      )}

      <section className={styles.block} aria-labelledby="angaben-titel">
        <h2 id="angaben-titel">{entry ? "Deine Angaben" : "Deine Anmeldung"}</h2>
        {!entry && !open ? (
          <p className="lead">Die Anmeldung ist geschlossen.</p>
        ) : (
          <ParticipationForm
            initialValues={entry ? toFormValues(entry) : { firstName: sessionUser.name }}
            helperRoles={roleOptions}
            genderEnabled={eventRow.genderEnabled}
            tournamentLocked={!open}
            isNew={!entry}
          />
        )}
      </section>

      <section className={styles.block} aria-labelledby="konto-titel">
        <h2 id="konto-titel">Dein Konto</h2>
        <div className={styles.konto}>
          <EmailForm currentEmail={sessionUser.email} />
          <PasswordForm />
          <form action={logoutAction}>
            <button type="submit" className="knopf knopf-zweit">
              Ausloggen
            </button>
          </form>
        </div>
      </section>

      <section className={styles.block} aria-labelledby="abmelden-titel">
        <h2 id="abmelden-titel">Doch nicht dabei?</h2>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
