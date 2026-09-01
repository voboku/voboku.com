"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext's production Link runtime currently blocks static route navigation */
import type { CSSProperties } from "react";
import { useRef, useState } from "react";
import type { WebInstrument } from "../_data/web-instruments";
import styles from "../instruments/web-instrument.module.css";

type WebInstrumentViewProps = {
  instrument: WebInstrument;
};

export function WebInstrumentView({ instrument }: WebInstrumentViewProps) {
  const [launchPhase, setLaunchPhase] = useState<"idle" | "loading" | "ready">(
    "idle",
  );
  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameMounted = launchPhase !== "idle";
  const loading = launchPhase === "loading";

  function handleFrameLoad() {
    setLaunchPhase("ready");
    requestAnimationFrame(() => frameRef.current?.focus());
  }

  return (
    <main
      className={styles.shell}
      style={{ "--instrument-accent": instrument.accent } as CSSProperties}
      aria-label={`${instrument.title} web instrument`}
    >
      <header className={styles.toolbar}>
        <a className={styles.backLink} href="/" aria-label="Back to Sound Objects">
          <span aria-hidden="true" />
        </a>
        <div className={styles.identity}>
          <h1>{instrument.title}</h1>
          <p>{instrument.description}</p>
        </div>
        <a
          className={styles.openLink}
          href={instrument.embedSrc}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${instrument.title} in a new tab`}
        >
          Open
        </a>
      </header>

      {frameMounted ? (
        <iframe
          ref={frameRef}
          className={styles.frame}
          src={instrument.embedSrc}
          title={`${instrument.title} playable instrument`}
          allow="autoplay; web-share; screen-wake-lock"
          sandbox="allow-scripts allow-downloads allow-popups allow-same-origin"
          tabIndex={loading ? -1 : 0}
          aria-hidden={loading ? "true" : undefined}
          onLoad={handleFrameLoad}
        />
      ) : null}

      {launchPhase !== "ready" ? (
        <section
          className={styles.launchStage}
          aria-label={`${instrument.title} launch screen`}
          aria-live={loading ? "polite" : undefined}
          aria-busy={loading ? "true" : undefined}
        >
          <img
            className={styles.launchIcon}
            src={instrument.iconSrc}
            alt=""
            aria-hidden="true"
          />
          <button
            className={styles.launchButton}
            type="button"
            onClick={() => setLaunchPhase("loading")}
            aria-label={`Launch ${instrument.title}`}
            disabled={loading}
          >
            {loading ? "Loading…" : "Launch"}
          </button>
        </section>
      ) : null}
    </main>
  );
}
