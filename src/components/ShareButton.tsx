"use client";

import { useState, useSyncExternalStore } from "react";
import styles from "./ShareButton.module.css";

type ShareButtonProps = {
  url: string;
  text: string;
};

function subscribe(): () => void {
  return () => {};
}

function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export function ShareButton({ url, text }: ShareButtonProps) {
  const nativeShare = useSyncExternalStore(subscribe, canUseNativeShare, () => false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text} ${url}`);

  async function shareNatively(): Promise<void> {
    try {
      await navigator.share({ title: "Ehemaligenturnier SC Münster 08", text, url });
    } catch {
      return;
    }
  }

  async function copyLink(): Promise<void> {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  if (nativeShare) {
    return (
      <button type="button" className="knopf" onClick={shareNatively}>
        Seite teilen
      </button>
    );
  }

  return (
    <div className={styles.gruppe}>
      <a className="knopf" href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer">
        Per WhatsApp teilen
      </a>
      <a
        className="knopf knopf-zweit"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a
        className="knopf knopf-zweit"
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Telegram
      </a>
      <button type="button" className="knopf knopf-zweit" onClick={copyLink}>
        {copied ? "Link kopiert" : "Link kopieren"}
      </button>
      <p className={`feld-hilfe ${styles.hinweis}`} aria-live="polite">
        Für Instagram: Link kopieren und in deiner Story oder Bio einfügen.
      </p>
    </div>
  );
}
