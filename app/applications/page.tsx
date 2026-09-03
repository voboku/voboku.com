/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the device's only scroll region must accept keyboard focus */
/* eslint-disable @next/next/no-html-link-for-pages -- vinext's production Link runtime currently blocks static route navigation */
import type { Metadata } from "next";
import { webApplications } from "../_data/web-instruments";
import styles from "./web-applications.module.css";

const canonicalUrl = "https://voboku.com/applications/";

export const metadata: Metadata = {
  title: "Web Applications — Sound Objects",
  description: webApplications.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Web Applications — Sound Objects",
    description: webApplications.description,
    url: canonicalUrl,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Web Applications — Sound Objects",
    description: webApplications.description,
  },
};

export default function WebApplicationsPage() {
  return (
    <main className="site-shell">
      <section
        className={"device " + styles.device}
        aria-label="Web applications"
      >
        <header className={styles.island}>
          <a className={styles.backLink} href="/" aria-label="Back to Sound Objects">
            <span className={styles.backArrow} aria-hidden="true" />
          </a>
          <span className={styles.islandSensor} aria-hidden="true" />
          <span className={styles.islandDot} aria-hidden="true" />
        </header>

        <div
          className={styles.scroll}
          role="region"
          tabIndex={0}
          aria-label="Web applications"
        >
          <h1 className={styles.srOnly}>Web Applications</h1>
          <nav className={styles.grid} aria-label="Choose a web application">
            {webApplications.members.map((instrument) => (
              <a
                className={styles.application}
                href={instrument.href}
                aria-label={"Open " + instrument.title}
                key={instrument.id}
              >
                <span className={styles.icon} aria-hidden="true">
                  <img src={instrument.iconSrc} alt="" />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>
    </main>
  );
}
