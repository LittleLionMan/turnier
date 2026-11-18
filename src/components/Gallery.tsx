"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import type { Photo } from "@/lib/photos";
import styles from "./Gallery.module.css";

const INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

function subscribeToMotion(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<number | null>(null);
  const swiped = useRef(false);

  return {
    swiped,
    handlers: {
      onPointerDown(event: PointerEvent<HTMLElement>): void {
        start.current = event.clientX;
        swiped.current = false;
      },
      onPointerUp(event: PointerEvent<HTMLElement>): void {
        if (start.current === null) return;
        const distance = event.clientX - start.current;
        start.current = null;
        if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return;
        swiped.current = true;
        onSwipe(distance < 0 ? 1 : -1);
      },
      onPointerCancel(): void {
        start.current = null;
      },
    },
  };
}

export function Gallery({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => true);
  const autoplay = photos.length > 1 && !paused && !enlarged && !reducedMotion;
  const several = photos.length > 1;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % photos.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, photos.length]);

  const show = (next: number) => setIndex((next + photos.length) % photos.length);
  const step = (direction: 1 | -1) => {
    setPaused(true);
    setIndex((current) => (current + direction + photos.length) % photos.length);
  };

  const stageSwipe = useSwipe(step);
  const dialogSwipe = useSwipe(step);

  function openEnlarged(): void {
    if (stageSwipe.swiped.current) return;
    dialogRef.current?.showModal();
    setEnlarged(true);
  }

  function closeEnlarged(): void {
    dialogRef.current?.close();
  }

  function handleDialogKeys(event: KeyboardEvent<HTMLDialogElement>): void {
    if (!several) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  }

  const current = photos[index];

  return (
    <div
      className={styles.galerie}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="Bildergalerie"
    >
      <button
        type="button"
        className={styles.buehne}
        onClick={openEnlarged}
        aria-label={`${current.caption} – groß anzeigen`}
        {...stageSwipe.handlers}
      >
        {photos.map((photo, photoIndex) => (
          <Image
            key={photo.file}
            src={photo.src}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 68rem) 100vw, 68rem"
            className={styles.bild}
            data-sichtbar={photoIndex === index}
            loading={photoIndex === 0 ? "eager" : "lazy"}
          />
        ))}
        <span className={styles.lupe} aria-hidden="true">
          Vergrößern
        </span>
      </button>
      <div className={styles.leiste}>
        <p className={styles.unterschrift} aria-live="polite">
          {current.caption}
        </p>
        {several && (
          <div className={styles.steuerung}>
            <button type="button" onClick={() => show(index - 1)} aria-label="Vorheriges Foto">
              ‹
            </button>
            <span className={styles.zaehler}>
              {index + 1} / {photos.length}
            </span>
            <button type="button" onClick={() => show(index + 1)} aria-label="Nächstes Foto">
              ›
            </button>
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.vollbild}
        aria-label={current.caption}
        onClose={() => setEnlarged(false)}
        onKeyDown={handleDialogKeys}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeEnlarged();
        }}
      >
        {enlarged && (
          <>
            <div className={styles.vollbildBild} {...dialogSwipe.handlers}>
              <Image src={current.src} alt={current.caption} fill unoptimized sizes="100vw" />
            </div>
            <div className={styles.vollbildLeiste}>
              <p className={styles.unterschrift}>{current.caption}</p>
              <div className={styles.steuerung}>
                {several && (
                  <>
                    <button type="button" onClick={() => step(-1)} aria-label="Vorheriges Foto">
                      ‹
                    </button>
                    <span className={styles.zaehler}>
                      {index + 1} / {photos.length}
                    </span>
                    <button type="button" onClick={() => step(1)} aria-label="Nächstes Foto">
                      ›
                    </button>
                  </>
                )}
                <button type="button" className={styles.schliessen} onClick={closeEnlarged} aria-label="Schließen">
                  ✕
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
