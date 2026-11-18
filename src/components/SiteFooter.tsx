import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.fuss}>
      <div className={`wrap ${styles.innen}`}>
        <p>Handballabteilung des SC Münster 08</p>
        <nav aria-label="Rechtliches" className={styles.links}>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <a href="https://scmuenster08.de/handball/">scmuenster08.de</a>
        </nav>
      </div>
    </footer>
  );
}
