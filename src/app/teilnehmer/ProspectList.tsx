import { Collapsible } from "@/components/Collapsible";
import { contactMethodLabel, type ProspectEntry } from "@/lib/prospects";
import {
  approveProspectAction,
  deleteProspectAction,
  markProspectRegisteredAction,
  undoInformationAction,
  withdrawProspectAction,
} from "./actions";
import { ProspectInformForm } from "./ProspectInformForm";
import styles from "./page.module.css";

function AdminDetails({ entry }: { entry: ProspectEntry }) {
  const details = entry.adminDetails;
  if (!details) return null;
  const lines = [
    details.suggestedBy ? `Vorgeschlagen von ${details.suggestedBy}` : null,
    entry.status === "informiert"
      ? [
          `Informiert von ${details.informedBy ?? "Unbekannt"}`,
          details.contactMethod ? contactMethodLabel(details.contactMethod) : null,
          details.contactNote ? `„${details.contactNote}“` : null,
        ]
          .filter((part) => part !== null)
          .join(", ")
      : null,
  ].filter((line) => line !== null);
  if (lines.length === 0) return null;
  return (
    <p className={styles.adminInfo}>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </p>
  );
}

function AdminActions({ entry }: { entry: ProspectEntry }) {
  if (!entry.adminDetails) return null;
  if (entry.status === "vorgeschlagen") {
    return (
      <>
        <form action={approveProspectAction.bind(null, entry.id)}>
          <button type="submit" className="knopf knopf-klein">
            Freigeben
          </button>
        </form>
        <form action={deleteProspectAction.bind(null, entry.id)}>
          <button type="submit" className="knopf knopf-zweit knopf-klein">
            Ablehnen
          </button>
        </form>
      </>
    );
  }
  return (
    <>
      <form action={markProspectRegisteredAction.bind(null, entry.id)}>
        <button type="submit" className="knopf knopf-zweit knopf-klein">
          Hat sich angemeldet
        </button>
      </form>
      <details className={styles.entfernen}>
        <summary>Entfernen</summary>
        <form action={deleteProspectAction.bind(null, entry.id)}>
          <p>„{entry.name}“ endgültig von der Liste löschen? Das zählt nicht als angemeldet.</p>
          <button type="submit" className="knopf knopf-gefahr knopf-klein">
            Endgültig löschen
          </button>
        </form>
      </details>
    </>
  );
}

function ProspectItem({ entry }: { entry: ProspectEntry }) {
  return (
    <li className={entry.status === "informiert" ? styles.erledigt : undefined}>
      <div className={styles.kopf}>
        <span className={styles.name}>{entry.name}</span>
        {entry.status === "vorgeschlagen" && <span className="marke marke-offen">wartet auf Freigabe</span>}
        {entry.status === "informiert" && <span className="marke marke-gruen">informiert</span>}
      </div>
      {entry.hint && <p className={styles.hinweisText}>{entry.hint}</p>}
      <AdminDetails entry={entry} />
      <div className={styles.aktionen}>
        {entry.status === "offen" && <ProspectInformForm prospectId={entry.id} name={entry.name} />}
        {entry.status === "informiert" && (entry.ownInformation || entry.adminDetails) && (
          <form action={undoInformationAction.bind(null, entry.id)}>
            <button type="submit" className="knopf knopf-zweit knopf-klein">
              Zurücknehmen
            </button>
          </form>
        )}
        {entry.status === "vorgeschlagen" && entry.ownSuggestion && !entry.adminDetails && (
          <form action={withdrawProspectAction.bind(null, entry.id)}>
            <button type="submit" className="knopf knopf-zweit knopf-klein">
              Zurückziehen
            </button>
          </form>
        )}
        <AdminActions entry={entry} />
      </div>
    </li>
  );
}

function Entries({ entries }: { entries: ProspectEntry[] }) {
  return (
    <ul className={styles.ehemalige}>
      {entries.map((entry) => (
        <ProspectItem key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}

export function ProspectList({ entries }: { entries: ProspectEntry[] }) {
  const open = entries.filter((entry) => entry.status !== "informiert");
  const done = entries.filter((entry) => entry.status === "informiert");

  if (entries.length === 0) {
    return <p className="leise">Noch steht niemand auf der Liste. Mach den Anfang!</p>;
  }
  return (
    <div className={styles.listen}>
      {open.length > 0 ? (
        <Entries entries={open} />
      ) : (
        <p className="leise">Alle auf der Liste wissen Bescheid. Fällt dir noch jemand ein?</p>
      )}
      {done.length > 0 && (
        <Collapsible summary={done.length === 1 ? "1 bereits informiert" : `${done.length} bereits informiert`}>
          <Entries entries={done} />
        </Collapsible>
      )}
    </div>
  );
}
