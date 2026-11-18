import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum" };

export default function ImprintPage() {
  return (
    <div className="wrap-schmal seite">
      <h1>Impressum</h1>
      <div className="hinweis">
        <p>[Platzhalter] Dieser Text muss vor dem Start mit dem Vorstand abgestimmt werden.</p>
      </div>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        SC Münster 08 e. V.
        <br />
        Mauritz-Lindenweg 97
        <br />
        48145 Münster
      </p>
      <p>
        Vertreten durch: [Vorstand eintragen]
        <br />
        Registergericht: [Amtsgericht eintragen], Registernummer: [VR eintragen]
      </p>
      <h2>Kontakt</h2>
      <p>
        Telefon: +49 251 35600
        <br />
        E-Mail: [Kontaktadresse für das Turnier eintragen]
      </p>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>[Name und Anschrift eintragen]</p>
    </div>
  );
}
