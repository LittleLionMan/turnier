import type { Metadata } from "next";

export const metadata: Metadata = { title: "Datenschutz" };

export default function PrivacyPage() {
  return (
    <div className="wrap-schmal seite">
      <h1>Datenschutz</h1>
      <div className="hinweis">
        <p>
          [Platzhalter] Entwurf als Grundlage. Bitte vor dem Start vom Vorstand bzw. der oder dem
          Datenschutzbeauftragten des Vereins prüfen lassen.
        </p>
      </div>
      <h2>Verantwortlicher</h2>
      <p>SC Münster 08 e. V., Mauritz-Lindenweg 97, 48145 Münster. Kontakt: [E-Mail eintragen]</p>

      <h2>Welche Daten wir speichern</h2>
      <p>
        Für die Anmeldung speichern wir deine E-Mail-Adresse, ein verschlüsseltes Passwort, deinen Vornamen und
        freiwillig deinen Spitznamen und den Zeitraum, in dem du im Verein aktiv warst. Wenn du am Turnier teilnimmst,
        kommen deine Positionen und gegebenenfalls dein Geschlecht dazu, außerdem deine Bestätigung des
        Versicherungshinweises. Wenn du mithilfst, speichern wir die gewählten Helferrollen. Für die Zahlung speichern
        wir, ob und wann dein Beitrag eingegangen ist. Für den Einkauf zum Abendprogramm speichern wir freiwillig deine
        Essens- und Getränkewünsche sowie die Anzahl deiner Begleitpersonen (ohne Namen).
      </p>

      <h2>Wofür</h2>
      <p>
        Ausschließlich zur Organisation des Ehemaligenturniers (Art. 6 Abs. 1 lit. b DSGVO). Die Anzeige auf der
        öffentlichen Teilnehmerliste erfolgt nur mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die du im
        Profil jederzeit widerrufen kannst.
      </p>

      <h2>Wer die Daten sieht</h2>
      <p>
        <p>
          Das Orga-Team des Vereins. Öffentlich sichtbar sind nur dein Spitzname (ohne Spitzname dein Vorname) und deine
          aktive Zeit – und das nur, wenn du zugestimmt hast. Alle anderen erscheinen als „Anonym“. Bestätigungs- und
          Passwort-Mails versenden wir über [Mail-Dienst eintragen, z. B. Brevo, Paris]. Über neue Anmeldungen
          informieren wir das Orga-Team in einer Telegram-Gruppe; dabei übermitteln wir Vorname, Spitzname, aktive Zeit,
          Turnierteilnahme und Helferrollen, aber keine E-Mail-Adresse. Die Zahlung läuft über PayPal; dort gelten die
          Datenschutzbestimmungen von PayPal.
        </p>
      </p>

      <h2>Cookies</h2>
      <p>Wir setzen nur ein technisch notwendiges Cookie, damit du eingeloggt bleibst. Es gibt kein Tracking.</p>

      <h2>Wie lange</h2>
      <p>
        Du kannst dein Konto im Profil jederzeit selbst löschen. Spätestens [Frist eintragen] nach dem Turnier löschen
        wir alle Anmeldungen.
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
        und Widerspruch sowie das Recht, dich bei einer Aufsichtsbehörde zu beschweren (in NRW: Landesbeauftragte für
        Datenschutz und Informationsfreiheit Nordrhein-Westfalen).
      </p>
    </div>
  );
}
