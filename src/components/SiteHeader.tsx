import Image from "next/image";
import Link from "next/link";
import { getSessionUser, isAdminEmail } from "@/lib/session";
import styles from "./SiteHeader.module.css";
import { SiteNav } from "./SiteNav";

export async function SiteHeader() {
  const user = await getSessionUser();
  const admin = user !== null && isAdminEmail(user.email);

  return (
    <header className={styles.kopf}>
      <div className={`wrap ${styles.leiste}`}>
        <Link href="/" className={styles.marke}>
          <Image src="/logo.png" alt="" width={34} height={46} priority />
          <span>
            Ehemaligenturnier
            <small>SC Münster 08 Handball</small>
          </span>
        </Link>
        <SiteNav loggedIn={user !== null} admin={admin} />
      </div>
    </header>
  );
}
