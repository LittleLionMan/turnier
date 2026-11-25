import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FEE_PENDING_NOTE,
  formatDate,
  formatFee,
  getCurrentEvent,
  isPaymentActive,
  isRegistrationOpen,
  registrationDeadline,
} from "@/lib/event";
import { helperRoleOptions } from "@/lib/helper-roles";
import { getSessionUser } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Anmelden" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/profil");

  const eventRow = await getCurrentEvent();
  const deadline = registrationDeadline(eventRow);

  if (!isRegistrationOpen(eventRow)) {
    return (
      <div className="wrap-schmal seite">
        <h1>Anmeldung geschlossen</h1>
        <p className="lead">Die Anmeldefrist ist abgelaufen. Wenn du trotzdem kommen möchtest, melde dich direkt beim Orga-Team.</p>
      </div>
    );
  }

  const helperRoles = await helperRoleOptions(eventRow.id);

  return (
    <div className="wrap-schmal seite">
      <h1>Anmelden</h1>
      <p className="lead">
        Alle melden sich fürs Event an. Ob du zusätzlich mitspielst oder hilfst, kreuzt du einfach an und kannst es
        später im Profil ändern.
      </p>
      <p className="leise">
        {isPaymentActive(eventRow) ? `Teilnahmebeitrag ${formatFee(eventRow.feeCents)}. ` : `${FEE_PENDING_NOTE} `}
        {deadline ? `Anmeldeschluss ist ${formatDate(deadline)}. ` : ""}
        Schon angemeldet? <Link href="/login">Hier einloggen</Link>.
      </p>
      <RegisterForm
        helperRoles={helperRoles}
        genderEnabled={eventRow.genderEnabled}
        guestFee={isPaymentActive(eventRow) ? formatFee(eventRow.feeCents) : null}
      />
    </div>
  );
}
