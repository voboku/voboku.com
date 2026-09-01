/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- the device's only scroll region must accept keyboard focus */
import Link from "next/link";
import type { CSSProperties } from "react";
import type { PluginDetail } from "../_data/plugins";
import styles from "../plugins/plugin-detail.module.css";

type PluginDetailViewProps = {
  plugin: PluginDetail;
};

export function PluginDetailView({ plugin }: PluginDetailViewProps) {
  const titleId = plugin.slug + "-title";
  const informationId = plugin.slug + "-information";
  const style = {
    "--plugin-accent": plugin.accent,
    "--plugin-media-background": plugin.mediaBackground,
  } as CSSProperties;

  return (
    <main className="site-shell">
      <section
        className={"device " + styles.device}
        style={style}
        aria-label={plugin.title + " plugin page"}
      >
        <header className={styles.island}>
          <Link
            className={styles.backLink}
            href="/"
            aria-label="Back to plugin home"
          >
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
          <article className={styles.article} aria-labelledby={titleId}>
            <section
              className={styles.mediaStage}
              data-presentation={plugin.mediaPresentation}
              aria-label={plugin.title + " media"}
              style={{
                aspectRatio: plugin.interfaceWidth + " / " + plugin.interfaceHeight,
              }}
            >
              <img src={plugin.interfaceImage} alt={plugin.interfaceAlt} />
            </section>

            <header className={styles.identity}>
              <img className={styles.icon} src={plugin.icon} alt="" />
              <div>
                <p className={styles.version}>{plugin.version}</p>
                <h1 id={titleId}>{plugin.title}</h1>
              </div>
            </header>

            <p className={styles.description}>{plugin.description}</p>

            {plugin.statusNote ? (
              <p className={styles.statusNote}>{plugin.statusNote}</p>
            ) : null}

            {plugin.videos.length ? (
              <section
                className={styles.videos}
                aria-labelledby={plugin.slug + "-films"}
              >
                <h2 id={plugin.slug + "-films"}>Film</h2>
                {plugin.videos.map((video) => (
                  <video
                    className={styles.featureVideo}
                    controls
                    playsInline
                    preload="metadata"
                    poster={video.poster}
                    width={video.width}
                    height={video.height}
                    aria-label={video.title}
                    key={video.id}
                  >
                    <source src={video.src} type={video.mimeType} />
                    <track
                      kind="captions"
                      src={video.captions}
                      srcLang="en"
                      label="English"
                    />
                  </video>
                ))}
              </section>
            ) : null}

            <section
              className={styles.downloads}
              aria-labelledby={plugin.slug + "-downloads"}
            >
              <h2 id={plugin.slug + "-downloads"}>Download</h2>
              {plugin.downloads.map((download) => {
                const detailsId = download.id + "-details";
                const noteId = download.id + "-note";

                return (
                  <article className={styles.downloadCard} key={download.id}>
                    <div className={styles.downloadHeading}>
                      <strong>{download.label}</strong>
                      <span
                        className={
                          download.availability === "candidate"
                            ? styles.candidateBadge
                            : download.availability === "available"
                              ? styles.availableBadge
                              : styles.pendingBadge
                        }
                      >
                        {download.availability === "candidate"
                          ? "Test build"
                          : download.availability === "available"
                            ? "Available"
                            : "Preparing release"}
                      </span>
                    </div>
                    <p className={styles.downloadMeta} id={detailsId}>
                      {download.meta}
                    </p>

                    {download.availability !== "pending" ? (
                      <a
                        className={styles.downloadLink}
                        href={download.href}
                        data-download-link
                        download={
                          download.delivery === "same-origin-file"
                            ? download.filename
                            : undefined
                        }
                        target={
                          download.delivery === "external-page" ? "_blank" : undefined
                        }
                        rel={
                          download.delivery === "external-page"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        aria-describedby={detailsId + " " + noteId}
                      >
                        {download.availability === "candidate"
                          ? "Download for macOS"
                          : download.delivery === "external-page"
                          ? "Open download page"
                          : "Download " + download.label}
                      </a>
                    ) : (
                      <p className={styles.downloadPending} aria-describedby={noteId}>
                        Release build in preparation
                      </p>
                    )}

                    <p
                      className={
                        styles.downloadNote +
                        (download.availability === "candidate"
                          ? " " + styles.candidateNote
                          : "")
                      }
                      id={noteId}
                    >
                      {download.note}
                    </p>

                    {download.availability !== "pending" ? (
                      <details className={styles.checksum}>
                        <summary>File verification</summary>
                        <code>{download.sha256}</code>
                      </details>
                    ) : null}
                  </article>
                );
              })}
            </section>

            <section aria-labelledby={informationId}>
              <h2 className={styles.visuallyHidden} id={informationId}>
                Product information
              </h2>
              <dl className={styles.factGrid}>
                {plugin.facts.map((fact) => (
                  <div className={styles.fact} key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className={styles.gestures} aria-label="Performance controls">
                {plugin.gestures.map((gesture) => (
                  <li key={gesture}>{gesture}</li>
                ))}
              </ul>
            </section>

            {plugin.previousVersions?.length ? (
              <section
                className={styles.previousVersions}
                aria-labelledby={plugin.slug + "-previous-versions"}
              >
                <h2 id={plugin.slug + "-previous-versions"}>Previous version</h2>
                {plugin.previousVersions.map((previous) => {
                  const previousTitleId = previous.id + "-title";

                  return (
                    <article
                      className={styles.previousVersion}
                      aria-labelledby={previousTitleId}
                      key={previous.id}
                    >
                      <header className={styles.previousVersionIdentity}>
                        <img
                          className={styles.previousVersionImage}
                          src={previous.image}
                          alt={previous.imageAlt}
                        />
                        <div>
                          <p className={styles.previousVersionLabel}>
                            Previous release
                          </p>
                          <h3 id={previousTitleId}>{previous.title}</h3>
                          <p className={styles.previousVersionNumber}>
                            {previous.version}
                          </p>
                        </div>
                      </header>

                      {previous.video ? (
                        <video
                          className={styles.previousVersionVideo}
                          controls
                          playsInline
                          preload="none"
                          poster={previous.video.poster}
                          width={previous.video.width}
                          height={previous.video.height}
                          aria-label={previous.video.title}
                        >
                          <source
                            src={previous.video.src}
                            type={previous.video.mimeType}
                          />
                          <track
                            kind="captions"
                            src={previous.video.captions}
                            srcLang="en"
                            label="English"
                          />
                        </video>
                      ) : null}

                      <p className={styles.previousVersionDescription}>
                        {previous.description}
                      </p>

                      <dl className={styles.factGrid}>
                        {previous.facts.map((fact) => (
                          <div className={styles.fact} key={fact.label}>
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <ul
                        className={styles.gestures}
                        aria-label={previous.title + " performance controls"}
                      >
                        {previous.gestures.map((gesture) => (
                          <li key={gesture}>{gesture}</li>
                        ))}
                      </ul>

                      <p className={styles.previousVersionNote}>{previous.note}</p>
                    </article>
                  );
                })}
              </section>
            ) : null}

            {plugin.samplePacks.length > 0 ? (
              <section
                className={styles.collection}
                aria-labelledby={plugin.slug + "-sample-packs"}
              >
                <h2 id={plugin.slug + "-sample-packs"}>Sample packs</h2>
                {plugin.samplePacks.map((pack) => (
                  <a className={styles.collectionCard} href={pack.href} key={pack.id}>
                    <img src={pack.cover} alt="" />
                    <span>{pack.title}</span>
                  </a>
                ))}
              </section>
            ) : null}

            {plugin.tracks.length > 0 ? (
              <section
                className={styles.collection}
                aria-labelledby={plugin.slug + "-music"}
              >
                <h2 id={plugin.slug + "-music"}>Music</h2>
                {plugin.tracks.map((track) => (
                  <div className={styles.track} key={track.id}>
                    <img src={track.artwork} alt="" />
                    <div>
                      <p>{track.title}</p>
                      {/* Audio is identified by the adjacent visible track title. */}
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio controls preload="none">
                        <source src={track.src} type={track.mimeType} />
                      </audio>
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            <footer className={styles.footer}>
              <Link href="/">Plugin Home</Link>
            </footer>
          </article>
        </div>
      </section>
    </main>
  );
}
