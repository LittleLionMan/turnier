import type { ContactMethod } from "@/db/schema";
import { normalizeName } from "./names";

export const MAX_IMPORT_ROWS = 500;

export type ImportRow = {
  name: string;
  hint: string | null;
  informed: boolean;
  contactMethod: ContactMethod | null;
  contactNote: string | null;
};

export type ImportProblem = "name-fehlt" | "name-zu-lang" | "schon-auf-liste" | "doppelt-in-datei";

export type PreviewRow = {
  line: number;
  row: ImportRow;
  problem: ImportProblem | null;
};

export const IMPORT_TEMPLATE = [
  "Name;Zusatzinfo;Informiert;Wie",
  "Thomas M.;Torwart 2014;ja;WhatsApp-Gruppe",
  "Kalle;2. Herren ca. 2005;;",
].join("\n");

const METHOD_KEYWORDS: { method: ContactMethod; pattern: RegExp }[] = [
  { method: "anruf", pattern: /anruf|angerufen|telefon/ },
  { method: "nachricht", pattern: /whats ?app|nachricht|sms|signal|telegram|mail/ },
  { method: "persoenlich", pattern: /personlich|persoenlich|getroffen/ },
  { method: "social_media", pattern: /social|facebook|instagram|linkedin/ },
];

const YES_VALUES = new Set(["ja", "j", "x", "yes", "y", "1", "true", "informiert"]);

export function decodeCsv(buffer: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

function detectDelimiter(firstLine: string): string {
  const candidates = [";", "\t", ","];
  return candidates.reduce((best, candidate) =>
    firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best,
  );
}

export function parseCsv(text: string): string[][] {
  const content = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(content.split(/\r?\n/, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && content[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function isHeader(cells: string[]): boolean {
  const first = normalizeName(cells[0] ?? "");
  const third = normalizeName(cells[2] ?? "");
  return /^(vor)?name|spitzname/.test(first) || third.startsWith("informiert");
}

function contactMethodFrom(text: string): ContactMethod | null {
  const normalized = normalizeName(text);
  return METHOD_KEYWORDS.find((entry) => entry.pattern.test(normalized))?.method ?? null;
}

function toRow(cells: string[]): ImportRow {
  const [name = "", hint = "", informedCell = "", how = ""] = cells.map((cell) => cell.trim());
  const howText = how.slice(0, 200);
  const informed = YES_VALUES.has(informedCell.toLowerCase()) || (informedCell === "" && howText !== "");
  return {
    name,
    hint: hint.slice(0, 120) || null,
    informed,
    contactMethod: informed ? contactMethodFrom(howText) : null,
    contactNote: informed && howText !== "" ? howText : null,
  };
}

export function previewImport(text: string, existingNames: string[]): PreviewRow[] {
  const rows = parseCsv(text);
  const startsWithHeader = rows.length > 0 && isHeader(rows[0]);
  const existing = new Set(existingNames.map(normalizeName));
  const seen = new Set<string>();

  return rows.slice(startsWithHeader ? 1 : 0, (startsWithHeader ? 1 : 0) + MAX_IMPORT_ROWS).map((cells, index) => {
    const row = toRow(cells);
    const key = normalizeName(row.name);
    const problem: ImportProblem | null =
      key.length < 2
        ? "name-fehlt"
        : row.name.length > 60
          ? "name-zu-lang"
          : existing.has(key)
            ? "schon-auf-liste"
            : seen.has(key)
              ? "doppelt-in-datei"
              : null;
    seen.add(key);
    return { line: index + (startsWithHeader ? 2 : 1), row, problem };
  });
}
