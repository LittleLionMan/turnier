import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Einloggen" };

type LoginPageProps = {
  searchParams: Promise<{ passwort?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getSessionUser()) redirect("/profil");
  const { passwort } = await searchParams;

  return (
    <div className="wrap-schmal seite">
      <h1>Einloggen</h1>
      {passwort === "neu" && (
        <div className="hinweis hinweis-ok" role="status">
          <p>Dein neues Passwort ist gespeichert. Du kannst dich jetzt einloggen.</p>
        </div>
      )}
      <p className="lead">
        Noch nicht angemeldet? <Link href="/anmelden">Hier geht’s zur Anmeldung.</Link>
      </p>
      <LoginForm />
    </div>
  );
}
