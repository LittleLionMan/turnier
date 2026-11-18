import Image from "next/image";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Gallery } from "@/components/Gallery";
import { SharePanel } from "@/components/SharePanel";
import { welcomeHeading, welcomeParagraphs, welcomeSignature } from "@/content/welcome";
import { db } from "@/db";
import { registration } from "@/db/schema";
import {
  FEE_PENDING_NOTE,
  formatDate,
  formatFee,
  getCurrentEvent,
  isPaymentActive,
  isRegistrationOpen,
  registrationDeadline,
} from "@/lib/event";
import { listPhotos } from "@/lib/photos";
import { getSessionUser } from "@/lib/session";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [eventRow, user, photos] = await Promise.all([getCurrentEvent(), getSessionUser(), listPhotos()]);
  const [{ value: registered }] = await db
    .select({ value: count() })
    .from(registration)
    .where(eq(registration.eventId, eventRow.id));
  const deadline = registrationDeadline(eventRow);
  const open = isRegistrationOpen(eventRow);

  return (
    <>
      <section className={styles.gelb}>
        <div className={`wrap ${styles.gelbInnen}`}>
          <div>
            <p className={styles.einladung}>Die Handballabteilung des SC Münster 08 lädt alle Ehemaligen ein.</p>
            <dl className={styles.fakten}>
              <div>
                <dt>Wann</dt>
                <dd>
                  {eventRow.eventDate ? formatDate(eventRow.eventDate) : "Termin folgt"}
                  {eventRow.startTime ? `, ab ${eventRow.startTime} Uhr` : ""}
                </dd>
              </div>
              <div>
                <dt>Wo</dt>
                <dd>{eventRow.location ?? "Ort folgt"}</dd>
              </div>
              <div>
                <dt>Anmeldung</dt>
                <dd>{deadline ? `bis ${formatDate(deadline)}` : "ab sofort offen"}</dd>
              </div>
            </dl>
            <div className={styles.aktionen}>
              {user ? (
                <Link href="/profil" className="knopf">
                  Zu deinem Profil
                </Link>
              ) : open ? (
                <Link href="/anmelden" className="knopf">
                  Jetzt anmelden
                </Link>
              ) : (
                <p className={styles.geschlossen}>Die Anmeldung ist geschlossen.</p>
              )}
              <Link href="/teilnehmer" className={styles.zaehler}>
                {registered === 1 ? "1 Person ist schon dabei" : `${registered} Leute sind schon dabei`}
              </Link>
            </div>
          </div>
          <Image src="/logo.png" alt="Wappen des SC Münster 08" width={220} height={297} className={styles.wappen} priority />
        </div>
      </section>

      <section className={styles.rot} aria-label="Veranstaltung">
        <h1 className={`wrap ${styles.titel}`}>{eventRow.name}</h1>
      </section>

      <section className={`wrap-schmal ${styles.gruss}`}>
        <h2>{welcomeHeading}</h2>
        {welcomeParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p className={styles.signatur}>{welcomeSignature}</p>
      </section>

      {photos.length > 0 && (
        <section className={styles.erfolge} aria-labelledby="erfolge-titel">
          <div className="wrap">
            <h2 id="erfolge-titel">Als wir noch jünger waren</h2>
            <Gallery photos={photos} />
          </div>
        </section>
      )}

      <section className={`wrap ${styles.wege}`} aria-labelledby="wege-titel">
        <h2 id="wege-titel">So kannst du dabei sein</h2>
        <div className={styles.wegeRaster}>
          <div>
            <h3>Einfach vorbeikommen</h3>
            <p>Alte Gesichter wiedersehen, zuschauen, quatschen. Dafür reicht die Anmeldung mit Vornamen.</p>
          </div>
          <div>
            <h3>Mitspielen</h3>
            <p>Gib an, auf welchen Positionen du spielst. Die Teams werden später gemischt ausgelost.</p>
          </div>
          <div>
            <h3>Mithelfen</h3>
            <p>Wir brauchen vor allem Leute, die pfeifen. Eine Lizenz ist nicht nötig, es ist ein Spaßturnier.</p>
          </div>
        </div>
        <p className={styles.beitrag}>
          {isPaymentActive(eventRow)
            ? `Der Teilnahmebeitrag beträgt ${formatFee(eventRow.feeCents)}. Nach der Anmeldung findest du in deinem Profil, wie du bezahlst. Verbindlich dabei bist du, sobald dein Beitrag eingegangen ist.`
            : FEE_PENDING_NOTE}
        </p>
      </section>

      <div className={`wrap-schmal ${styles.teilen}`}>
        <SharePanel
          heading="Sag es weiter"
          text="Je mehr alte Mitspieler kommen, desto besser wird's. Schick die Seite an alle, die du von früher kennst."
        />
      </div>
    </>
  );
}
