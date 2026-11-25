"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon, type NavIconName } from "./NavIcon";
import styles from "./SiteNav.module.css";

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: NavIconName;
  primary?: boolean;
  desktop: boolean;
};

type SiteNavProps = {
  loggedIn: boolean;
  admin: boolean;
};

function navItems({ loggedIn, admin }: SiteNavProps): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Start", shortLabel: "Start", icon: "start", desktop: false },
    { href: "/teilnehmer", label: "Wer ist dabei?", shortLabel: "Dabei", icon: "teilnehmer", desktop: true },
  ];
  if (admin) {
    items.push({ href: "/admin", label: "Admin", shortLabel: "Admin", icon: "admin", desktop: true });
  }
  if (loggedIn) {
    items.push({ href: "/profil", label: "Mein Profil", shortLabel: "Profil", icon: "profil", primary: true, desktop: true });
  } else {
    items.push(
      { href: "/login", label: "Einloggen", shortLabel: "Einloggen", icon: "einloggen", desktop: true },
      { href: "/anmelden", label: "Anmelden", shortLabel: "Anmelden", icon: "anmelden", primary: true, desktop: true },
    );
  }
  return items;
}

function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteNav(props: SiteNavProps) {
  const pathname = usePathname();
  const items = navItems(props);

  return (
    <>
      <nav aria-label="Hauptnavigation" className={styles.oben}>
        {items
          .filter((item) => item.desktop)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.primary ? styles.obenAktion : styles.obenLink}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
      </nav>
      <nav aria-label="Navigation" className={styles.unten}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.primary ? `${styles.tab} ${styles.tabAktion}` : styles.tab}
            aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
          >
            <NavIcon name={item.icon} />
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
