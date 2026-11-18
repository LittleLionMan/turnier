import Image from "next/image";
import Link from "next/link";
import { getSessionUser, isAdminEmail } from "@/lib/session";
import styles from "./SiteHeader.module.css";

export async function SiteHeader() {
  const user = await getSessionUser();
  const admin = user !== null && isAdminEmail(user.email);

  return (
    <header className={styles.kopf}>
      <div className={styles.streifen} aria-hidden="true" />
      <div className={`wrap ${styles.leiste}`}>
        <Link href="/" className={styles.marke}>
          <Image src="/logo.png" alt="" width={34} height={46} priority />
          <span>Ehemaligenturnier</span>
        </Link>
        <nav aria-label="Hauptnavigation" className={styles.nav}>
          <Link href="/teilnehmer">Wer ist dabei?</Link>
          {admin && <Link href="/admin">Admin</Link>}
          {user ? (
            <Link href="/profil" className={styles.aktion}>
              Mein Profil
            </Link>
          ) : (
            <>
              <Link href="/login">Einloggen</Link>
              <Link href="/anmelden" className={styles.aktion}>
                Anmelden
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
