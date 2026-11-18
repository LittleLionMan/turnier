import type { Metadata } from "next";
import { RequestResetForm } from "./RequestResetForm";

export const metadata: Metadata = { title: "Passwort vergessen" };

export default function ForgotPasswordPage() {
  return (
    <div className="wrap-schmal seite">
      <h1>Passwort vergessen</h1>
      <p className="lead">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort vergibst.</p>
      <RequestResetForm />
    </div>
  );
}
