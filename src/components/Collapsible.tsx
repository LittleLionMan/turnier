import type { ReactNode } from "react";
import styles from "./Collapsible.module.css";

export function Collapsible({ summary, children }: { summary: string; children: ReactNode }) {
  return (
    <details className={styles.klappe}>
      <summary>{summary}</summary>
      {children}
    </details>
  );
}
