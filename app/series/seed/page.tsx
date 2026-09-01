/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the device's only scroll region must accept keyboard focus */
import type { Metadata } from "next";
import Link from "next/link";
import { seedSeries } from "../../_data/plugins";
import styles from "./seed-series.module.css";

const canonicalUrl = "https://voboku.com/series/seed/";
const socialImage = "https://voboku.com/media/driftfield-interface.jpg";

export const metadata: Metadata = {
  title: "SEED Series — Sound Objects",
  description: seedSeries.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "SEED Series — Sound Objects",
    description: seedSeries.description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1280,
        height: 884,
        alt: "DriftField plugin interface",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SEED Series — Sound Objects",
    description: seedSeries.description,
    images: [socialImage],
  },
};

export default function SeedSeriesPage() {
  const titleId = "seed-series-title";

  return (
    <main className="site-shell">
      <section
        className={"device " + styles.device}
        aria-label="SEED series page"
      >
        <header className={styles.island}>
          <Link className={styles.backLink} href="/" aria-label="Back to plugin home">
            <span className={styles.backArrow} aria-hidden="true" />
          </Link>
          <span className={styles.islandSensor} aria-hidden="true" />
          <span className={styles.islandDot} aria-hidden="true" />
        </header>

        <div
          className={styles.scroll}
          role="region"
          tabIndex={0}
          aria-labelledby={titleId}
        >
          <article className={styles.article}>
            <header className={styles.intro}>
              <h1 id={titleId}>SEED</h1>
              <span>{seedSeries.description}</span>
            </header>

            <section aria-labelledby="seed-series-members">
              <h2 id="seed-series-members">Series</h2>
              <div className={styles.grid} role="list">
                {seedSeries.members.map((member) => (
                  member.detailHref ? (
                    <Link
                      className={styles.member}
                      href={member.detailHref}
                      aria-label={"Open " + member.name}
                      role="listitem"
                      key={member.id}
                    >
                      <div
                        className={styles.visual}
                        data-kind={member.visualKind}
                      >
                        <img src={member.visual} alt={member.visualAlt} />
                      </div>
                      <h3>{member.name}</h3>
                    </Link>
                  ) : (
                    <article className={styles.member} role="listitem" key={member.id}>
                      <div
                        className={styles.visual}
                        data-kind={member.visualKind}
                      >
                        <img src={member.visual} alt={member.visualAlt} />
                      </div>
                      <h3>{member.name}</h3>
                    </article>
                  )
                ))}
              </div>
            </section>
          </article>
        </div>
      </section>
    </main>
  );
}
