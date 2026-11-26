"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/form-bits";
import { CONTACT_METHODS } from "@/lib/constants";
import {
  decodeCsv,
  IMPORT_TEMPLATE,
  previewImport,
  type ImportProblem,
  type NameAndHint,
  type PreviewRow,
} from "@/lib/prospect-import";
import type { FormState } from "@/lib/validation";
import { importProspectsAction } from "./actions";
import styles from "./page.module.css";

const PROBLEM_LABELS: Record<ImportProblem, string> = {
  "name-fehlt": "Name fehlt",
  "name-zu-lang": "Name zu lang (max. 60 Zeichen)",
  "schon-auf-liste": "Steht schon auf der Liste (gleiche oder keine Zusatzinfo)",
  "doppelt-in-datei": "Doppelt in der Datei (gleiche oder keine Zusatzinfo)",
};

const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(`\uFEFF${IMPORT_TEMPLATE}`)}`;

function statusText(entry: PreviewRow): string {
  if (entry.problem) return PROBLEM_LABELS[entry.problem];
  if (!entry.row.informed) return "Neu, noch nicht informiert";
  const method = CONTACT_METHODS.find((option) => option.value === entry.row.contactMethod)?.label;
  return method ? `Neu, informiert (${method})` : "Neu, informiert";
}

export function ProspectImport({ existing }: { existing: NameAndHint[] }) {
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [state, formAction] = useActionState(async (previous: FormState, formData: FormData) => {
    const result = await importProspectsAction(previous, formData);
    if (result.status === "success") {
      setPreview(null);
      setFileKey((key) => key + 1);
    }
    return result;
  }, { status: "idle" } satisfies FormState);

  const importable = preview?.filter((entry) => entry.problem === null) ?? [];
  const skipped = (preview?.length ?? 0) - importable.length;

  async function readFile(file: File | undefined) {
    if (!file) {
      setPreview(null);
      return;
    }
        setPreview(previewImport(decodeCsv(await file.arrayBuffer()), existing));
  }

  return (
    <form action={formAction} className={styles.import}>
      <FormMessage state={state} />
      <p className="leise">
        Eine Zeile pro Person: Name, Zusatzinfo, informiert (ja oder leer), wie informiert. Eine Kopfzeile ist
        optional. Aus Excel speichert ihr am besten als „CSV UTF-8“. <a href={TEMPLATE_HREF} download="ehemalige-vorlage.csv">Vorlage herunterladen</a>
      </p>
      <div className="feld">
        <label htmlFor="prospect-import-datei">CSV-Datei</label>
        <input
          key={fileKey}
          id="prospect-import-datei"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void readFile(event.target.files?.[0])}
        />
      </div>
      {preview && preview.length === 0 && <p className="feld-fehler">In der Datei stehen keine Einträge.</p>}
      {preview && preview.length > 0 && (
        <>
          <p>
            <strong>
              {importable.length} {importable.length === 1 ? "Eintrag wird" : "Einträge werden"} importiert
            </strong>
            {skipped > 0 && <span className="leise">, {skipped} übersprungen</span>}
          </p>
          <div className={styles.scroller}>
            <table className="tabelle">
              <thead>
                <tr>
                  <th scope="col">Zeile</th>
                  <th scope="col">Name</th>
                  <th scope="col">Zusatzinfo</th>
                  <th scope="col">Status</th>
                  <th scope="col">Notiz</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((entry) => (
                  <tr key={entry.line} className={entry.problem ? styles.importUebersprungen : undefined}>
                    <td>{entry.line}</td>
                    <td>{entry.row.name || "–"}</td>
                    <td>{entry.row.hint ?? "–"}</td>
                    <td>{statusText(entry)}</td>
                    <td>{entry.row.contactNote ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <input type="hidden" name="rows" value={JSON.stringify(importable.map((entry) => entry.row))} />
          {importable.length > 0 && (
            <SubmitButton
              label={`${importable.length} ${importable.length === 1 ? "Eintrag" : "Einträge"} importieren`}
              pendingLabel="Wird importiert …"
            />
          )}
        </>
      )}
    </form>
  );
}
