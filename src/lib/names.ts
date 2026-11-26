export type KnownName = {
  name: string;
  source: "liste" | "angemeldet";
};

export function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replaceAll("ß", "ss")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function firstToken(name: string): string {
  return normalizeName(name).split(" ")[0] ?? "";
}

export function sameName(a: string, b: string): boolean {
  return normalizeName(a) === normalizeName(b);
}

export function similarNames(input: string, known: KnownName[]): KnownName[] {
  const token = firstToken(input);
  if (token.length < 2) return [];
  return known.filter((entry) => firstToken(entry.name) === token);
}
