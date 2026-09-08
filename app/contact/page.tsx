/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the device's scroll region must accept keyboard focus */
/* eslint-disable @next/next/no-html-link-for-pages -- use normal links for the static export */
import type { Metadata } from "next";
import chrome from "../applications/web-applications.module.css";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "https://voboku.com/contact/" },
};

export default function ContactPage() {
  return (
    <main className="site-shell">
      <section className={"device " + chrome.device} aria-label="Contact">
        <header className={chrome.island}>
          <a className={chrome.backLink} href="/" aria-label="Back to home">
            <span className={chrome.backArrow} aria-hidden="true" />
          </a>
          <span className={chrome.islandSensor} aria-hidden="true" />
          <span className={chrome.islandDot} aria-hidden="true" />
        </header>

        <div
          className={chrome.scroll + " " + styles.scroll}
          role="region"
          tabIndex={0}
          aria-label="Contact details"
        >
          <h1 className={styles.heading}>Contact</h1>
          <nav className={styles.links} aria-label="Choose a contact method">
            <a className={styles.link} href="mailto:booking.vq@gmail.com">
              <span className={styles.channel}>Email</span>
              <span className={styles.address}>booking.vq@gmail.com</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
            <a
              className={styles.link}
              href="https://x.com/voboku"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter), @voboku — opens in a new tab"
            >
              <span className={styles.channel}>X (Twitter)</span>
              <span className={styles.address}>@voboku</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
            <a
              className={styles.link}
              href="https://www.instagram.com/voboku/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram, @voboku — opens in a new tab"
            >
              <span className={styles.channel}>Instagram</span>
              <span className={styles.address}>@voboku</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      </section>
    </main>
  );
}
