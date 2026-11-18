import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Neues Passwort" };

type ResetPageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPageProps) {
  const { token, error } = await searchParams;

  return (
    <div className="wrap-schmal seite">
      <h1>Neues Passwort</h1>
      {!token || error ? (
        <div className="hinweis hinweis-fehler" role="alert">
          <p>
            Der Link ist ungültig oder abgelaufen. <Link href="/passwort-vergessen">Fordere einen neuen Link an.</Link>
          </p>
        </div>
      ) : (
        <ResetForm token={token} />
      )}
    </div>
  );
}
