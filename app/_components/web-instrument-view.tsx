/* eslint-disable @next/next/no-html-link-for-pages -- vinext's production Link runtime currently blocks static route navigation */
import type { CSSProperties } from "react";
import type { WebInstrument } from "../_data/web-instruments";
import styles from "../instruments/web-instrument.module.css";

type WebInstrumentViewProps = {
  instrument: WebInstrument;
};

export function WebInstrumentView({ instrument }: WebInstrumentViewProps) {
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

      <iframe
        className={styles.frame}
        src={instrument.embedSrc}
        title={`${instrument.title} playable instrument`}
        allow="autoplay; web-share; screen-wake-lock"
        sandbox="allow-scripts allow-downloads allow-popups allow-same-origin"
      />
    </main>
  );
}
