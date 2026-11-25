export type NavIconName =
  | "start"
  | "teilnehmer"
  | "einloggen"
  | "anmelden"
  | "profil"
  | "admin"
  | "datum"
  | "ort"
  | "frist";

const PATHS: Record<NavIconName, string[]> = {
  start: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h5v-6h4v6h5V9.5"],
  teilnehmer: [
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M1.5 21v-1a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v1",
    "M16 3.2a4 4 0 0 1 0 7.6",
    "M19 14.2a6 6 0 0 1 3.5 5.8v1",
  ],
  einloggen: ["M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5", "M10 17l5-5-5-5", "M15 12H3"],
  anmelden: ["M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M2.5 21v-1a6 6 0 0 1 6-6h3a6 6 0 0 1 4 1.5", "M19 14v7", "M15.5 17.5h7"],
  profil: ["M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 21v-1a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v1"],
  admin: ["M12 2.5 4 5.5v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10v-6l-8-3Z", "M9 12l2 2 4-4"],
  datum: ["M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5v-13Z", "M4 10h16", "M8.5 3v4", "M15.5 3v4"],
  ort: ["M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z", "M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  frist: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
};

export function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}
