import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost/"), {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the unlock-state gate and the available plugin pages only", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Sound Objects — Music Plugins<\/title>/);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /Sound Objects lock screen/);
  assert.doesNotMatch(html, /Swipe up to open|Open passcode entry/);
  assert.doesNotMatch(html, /Enter Passcode|Passcode keypad/);
  assert.match(html, /Sound Objects plugin home/);
  assert.match(html, /class="home-lock-button"/);
  assert.match(html, /aria-label="Lock Sound Objects"/);
  assert.doesNotMatch(html, /Opening Sound Objects/);
  assert.match(html, /Available sound objects/);
  assert.equal((html.match(/class="plugin-app"/g) ?? []).length, 4);
  assert.match(html, /\/media\/driftfield-icon-tactile-splice\.png/);
  assert.match(html, /\/media\/bugnote-3-icon\.png/);
  assert.doesNotMatch(html, /href="\/plugins\/driftfield"/);
  assert.match(html, /href="\/plugins\/bugnote-3"/);
  assert.match(html, /href="\/series\/seed"/);
  assert.match(html, /Open SEED series/);
  assert.match(html, /href="\/instruments\/imagescansound"/);
  assert.match(html, /href="\/instruments\/orbitonic"/);
  assert.match(html, /Open imagescansound/);
  assert.match(html, /Open orbitonic/);
  assert.match(html, /\/media\/imagescansound-icon\.svg/);
  assert.match(html, /\/media\/orbitonic-icon\.svg/);
  assert.match(html, /data-instrument="imagescansound"/);
  assert.match(html, /data-instrument="orbitonic"/);
  assert.doesNotMatch(
    html,
    /\/media\/(?:ecosystem-drums\.jpg|flower-groove\.png)/,
  );
  assert.doesNotMatch(html, /home-dock|archive-app-icon|capsule-nav|archive-layer/);
  assert.doesNotMatch(html, /release-widget|IN DEVELOPMENT/);
  assert.doesNotMatch(html, /Open (?:COLONY|Ecosystem Drums|Flower Groove|Archive)/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders both playable web instruments in isolated frames", async () => {
  for (const instrument of [
    {
      slug: "imagescansound",
      title: "imagescansound",
      description: "turns image structure into time, pitch and timbre",
    },
    {
      slug: "orbitonic",
      title: "orbitonic",
      description: "turns planetary orbits and crossings into rhythm",
    },
  ]) {
    const response = await render(`/instruments/${instrument.slug}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, new RegExp(`<title>${instrument.title} — Sound Objects<\\/title>`));
    assert.match(html, new RegExp(instrument.description));
    assert.match(html, new RegExp(`${instrument.title} web instrument`));
    assert.match(html, /Back to Sound Objects/);
    assert.match(html, /href="\/"/);
    assert.match(
      html,
      new RegExp(`src="/web-instruments/${instrument.slug}/index\\.html"`),
    );
    assert.match(html, new RegExp(`${instrument.title} playable instrument`));
    assert.match(html, /allow="autoplay; web-share; screen-wake-lock"/);
    assert.match(
      html,
      /sandbox="allow-scripts allow-downloads allow-popups allow-same-origin"/,
    );
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /https:\/\/(?:imagescansound|orbitonic)\.netlify\.app/);
    assert.doesNotMatch(html, /https:\/\/voboku\.com\/og\.png/);
    assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
  }
});

test("server-renders the SEED series as one grouped collection", async () => {
  const response = await render("/series/seed");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>SEED Series — Sound Objects<\/title>/);
  assert.match(html, /SEED series page/);
  assert.match(html, /Back to plugin home/);
  assert.match(html, /first completed instrument in the SEED series/);
  assert.equal((html.match(/role="listitem"/g) ?? []).length, 1);
  assert.match(html, /DriftField application icon/);
  assert.match(html, /href="\/plugins\/driftfield"/);
  assert.doesNotMatch(
    html,
    /SEED application icon|Ecosystem Drums|COLONY|Persistent Spectral|Flower Groove|GrainTime|bugnote 3/,
  );
  assert.doesNotMatch(
    html,
    /seed-series-(?:seed|ecosystem-drums|persistent-spectral)\.png/,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders bugnote 3 with a pending public download", async () => {
  const response = await render("/plugins/bugnote-3");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>bugnote 3 — Sound Objects<\/title>/);
  assert.match(html, /bugnote 3 plugin page/);
  assert.match(html, /\/media\/bugnote-3-ui\.jpg/);
  assert.match(html, /\/media\/bugnote-3-icon\.png/);
  assert.match(html, /Back to plugin home/);
  assert.match(html, /href="\/"/);
  assert.match(html, /macOS 11 target \/ Universal 2/);
  assert.match(html, /AU \/ VST3 \/ Standalone/);
  assert.match(html, /An interactive granular instrument/);
  assert.match(html, />Download</);
  assert.match(html, /Preparing release/);
  assert.match(html, /Release build in preparation/);
  assert.match(html, /A public macOS build is not available yet/);
  assert.equal(
    (html.match(/<a\b[^>]*\bdata-download-link\b/g) ?? []).length,
    0,
  );
  assert.doesNotMatch(
    html,
    /macOS11-candidate\.zip|7219847d1a948dcf013e21685b933864480a2aaa8604f4d593a15607e198a66a|File verification|Test build|Download for macOS/,
  );
  assert.match(html, />Previous version</);
  assert.match(html, />Previous release</);
  assert.match(html, />bugnote</);
  assert.match(html, />v0\.4\.2</);
  assert.match(html, /\/media\/bugnote-legacy-icon\.png/);
  assert.match(html, /rotating particle cloud/);
  assert.match(html, /Ambient Bloom/);
  assert.match(html, /Instrument \/ Sampler/);
  assert.match(html, /WAV \/ AIFF \/ MP3 \/ FLAC/);
  assert.match(html, /24-bit WAV recording/);
  assert.match(html, /separately validated v0\.4\.2 download package is not available yet/);
  assert.equal((html.match(/<video\b/g) ?? []).length, 1);
  assert.match(html, /preload="none"/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /poster="\/media\/bugnote-interface-recording-poster\.jpg"/);
  assert.match(html, /\/media\/bugnote-interface-recording\.mp4/);
  assert.match(html, /\/media\/bugnote-interface-recording-en\.vtt/);
  assert.match(html, /bugnote interface and sound demonstration/);
  assert.doesNotMatch(html, /current candidate targets macOS 26/);
  assert.doesNotMatch(html, /<audio\b/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders DriftField with a pending public download", async () => {
  const response = await render("/plugins/driftfield");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>DriftField — Sound Objects<\/title>/);
  assert.match(html, /DriftField plugin page/);
  assert.match(html, /\/media\/driftfield-icon-tactile-splice\.png/);
  assert.match(html, /\/media\/driftfield-interface\.jpg/);
  assert.match(html, /The DriftField plugin interface running inside FL Studio/);
  assert.match(html, /Back to plugin home/);
  assert.match(html, /href="\/"/);
  assert.match(html, /v0\.5\.1 · DEVELOPMENT/);
  assert.match(html, /macOS 12\+ \/ Universal 2/);
  assert.match(html, /VST3 friend test/);
  assert.match(html, /Up to 64/);
  assert.match(html, /Growth/);
  assert.match(html, /MATCH/);
  assert.match(html, />Download</);
  assert.match(html, /Preparing release/);
  assert.match(html, /Release build in preparation/);
  assert.match(html, /friend-test build is not available for public download/);
  assert.match(
    html,
    /This screen recording documents the current 0\.5\.1 development build in use/,
  );
  assert.equal(
    (html.match(/<a\b[^>]*\bdata-download-link\b/g) ?? []).length,
    0,
  );
  assert.doesNotMatch(
    html,
    /DriftField-0\.5\.1-macOS-Universal-VST3-Friend-Test\.zip|2d9c0f77f921b7157cbfedc609f99dcd055e41112faa2b376255c16473e24faa|File verification|Test build|Download for macOS/,
  );
  assert.doesNotMatch(html, /Previous version|bugnote-v0-4-2|bugnote-legacy-icon/);
  assert.doesNotMatch(html, /\/media\/driftfield\.jpg/);
  assert.match(html, />Film<\/h2>/);
  assert.equal((html.match(/<video\b/g) ?? []).length, 1);
  assert.match(html, /preload="metadata"/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /width="1280"/);
  assert.match(html, /height="856"/);
  assert.match(html, /poster="\/media\/driftfield-interface-recording-poster\.jpg"/);
  assert.match(html, /\/media\/driftfield-interface-recording\.mp4/);
  assert.match(html, /\/media\/driftfield-interface-recording-en\.vtt/);
  assert.match(html, /DriftField interface and sound demonstration/);
  assert.doesNotMatch(html, /<audio\b/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("exports all routes and social metadata without private test builds", async () => {
  const [
    rootHtml,
    bugnoteHtml,
    driftFieldHtml,
    seedHtml,
    netlifyConfig,
    driftFieldVideo,
  ] = await Promise.all([
    readFile(new URL("../dist/client/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/plugins/bugnote-3.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/plugins/driftfield.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/series/seed.html", import.meta.url), "utf8"),
    readFile(new URL("../netlify.toml", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../dist/client/media/driftfield-interface-recording.mp4",
        import.meta.url,
      ),
    ),
  ]);

  assert.match(rootHtml, /<meta property="og:title" content="Sound Objects — Music Plugins"\/>/);
  assert.match(rootHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/og\.png"\/>/);
  assert.match(rootHtml, /<meta name="twitter:image" content="https:\/\/voboku\.com\/og\.png"\/>/);
  assert.match(bugnoteHtml, /<link rel="canonical" href="https:\/\/voboku\.com\/plugins\/bugnote-3\/"\/>/);
  assert.match(bugnoteHtml, /<meta property="og:title" content="bugnote 3 — Sound Objects"\/>/);
  assert.match(bugnoteHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/media\/bugnote-3-ui\.jpg"\/>/);
  assert.match(driftFieldHtml, /<link rel="canonical" href="https:\/\/voboku\.com\/plugins\/driftfield\/"\/>/);
  assert.match(driftFieldHtml, /<meta property="og:title" content="DriftField — Sound Objects"\/>/);
  assert.match(driftFieldHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/media\/driftfield-interface\.jpg"\/>/);
  assert.match(seedHtml, /<link rel="canonical" href="https:\/\/voboku\.com\/series\/seed\/"\/>/);
  assert.match(seedHtml, /<meta property="og:title" content="SEED Series — Sound Objects"\/>/);
  assert.match(seedHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/media\/driftfield-interface\.jpg"\/>/);
  assert.match(netlifyConfig, /command\s*=\s*"npm test"/);
  assert.match(netlifyConfig, /\[build\.processing\.html\][\s\S]*pretty_urls\s*=\s*true/);
  await assert.rejects(
    access(
      new URL(
        "../dist/client/downloads/bugnote-3-v3.0.1-macOS-Universal-2-macOS11-candidate.zip",
        import.meta.url,
      ),
    ),
    (error) => error?.code === "ENOENT",
  );
  await assert.rejects(
    access(
      new URL(
        "../dist/client/downloads/DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
        import.meta.url,
      ),
    ),
    (error) => error?.code === "ENOENT",
  );
  assert.equal(driftFieldVideo.byteLength, 9_236_331);
  assert.equal(
    createHash("sha256").update(driftFieldVideo).digest("hex"),
    "79cb1d134e19e1362d5ea6572fb51c6a0f0acab3dc3134ee830ff2c539c37701",
  );
});

test("exports the immutable web-instrument snapshots under the same origin", async () => {
  const instruments = [
    {
      slug: "imagescansound",
      icon: {
        filename: "imagescansound-icon.svg",
        hash: "c76991988729db2e5b8e720acbdd5e1013bf986b306c05263d7e7509f135f482",
      },
      expected: {
        "index.html": "1523f39a81518b98a68ee9a000b74989fb9e5fbbfb17dc312405c7ff0b411a41",
        "styles.css": "6a3d83f601ec356b5f2032cf6cc9a4b9de720dd5ad93d022d605c19606194dde",
        "app.js": "43a9f9ac09acfb927fb786178b5fcf96f9131d327c621acb9c0381a8773646a5",
      },
    },
    {
      slug: "orbitonic",
      icon: {
        filename: "orbitonic-icon.svg",
        hash: "9ac8727cea3243309dfa9aa12966030bcb03c3ada45eb8be18c5d61232305163",
      },
      expected: {
        "index.html": "3a8a4ebbd94b706ecb4b9ac7ecb6aafeea49575acba798c02ef93f8273a4b8c8",
        "styles.css": "c1011212f308c10c520209e9484ee38837aae2c5aff24c9cebe59a470beb99bf",
        "app.js": "b9ea9b4c62b6d58bd2bd86faa87e709f03b09da5597b823f84fb6474c59187e2",
      },
    },
  ];

  for (const instrument of instruments) {
    const routeHtml = await readFile(
      new URL(`../dist/client/instruments/${instrument.slug}.html`, import.meta.url),
      "utf8",
    );
    assert.match(
      routeHtml,
      new RegExp(
        `<link rel="canonical" href="https://voboku\\.com/instruments/${instrument.slug}/"/>`,
      ),
    );
    assert.match(
      routeHtml,
      new RegExp(
        `<meta property="og:title" content="${instrument.slug} — Sound Objects"/>`,
      ),
    );
    assert.doesNotMatch(routeHtml, /https:\/\/voboku\.com\/og\.png/);

    const [sourceIcon, exportedIcon] = await Promise.all([
      readFile(new URL(`../public/media/${instrument.icon.filename}`, import.meta.url)),
      readFile(new URL(`../dist/client/media/${instrument.icon.filename}`, import.meta.url)),
    ]);
    assert.equal(
      createHash("sha256").update(sourceIcon).digest("hex"),
      instrument.icon.hash,
    );
    assert.equal(
      createHash("sha256").update(exportedIcon).digest("hex"),
      instrument.icon.hash,
    );

    for (const [filename, expectedHash] of Object.entries(instrument.expected)) {
      const [sourceAsset, exportedAsset] = await Promise.all([
        readFile(
          new URL(
            `../public/web-instruments/${instrument.slug}/${filename}`,
            import.meta.url,
          ),
        ),
        readFile(
          new URL(
            `../dist/client/web-instruments/${instrument.slug}/${filename}`,
            import.meta.url,
          ),
        ),
      ]);
      assert.equal(createHash("sha256").update(sourceAsset).digest("hex"), expectedHash);
      assert.equal(createHash("sha256").update(exportedAsset).digest("hex"), expectedHash);
    }
  }
});

test("requires the six-digit passcode and keeps home and downloads accessible", async () => {
  const [
    page,
    styles,
    layout,
    pluginData,
    detailView,
    detailStyles,
    webInstrumentData,
    webInstrumentView,
    webInstrumentStyles,
  ] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
      readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/_data/plugins.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/_components/plugin-detail-view.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/plugins/plugin-detail.module.css", import.meta.url), "utf8"),
      readFile(new URL("../app/_data/web-instruments.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/_components/web-instrument-view.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/instruments/web-instrument.module.css", import.meta.url), "utf8"),
    ]);

  assert.match(page, /^"use client";/);
  assert.match(page, /const passcodeLength = 6/);
  assert.match(page, /const lockPasscode = "000000"/);
  assert.match(page, /Swipe up to open/);
  assert.match(page, /Open passcode entry/);
  assert.match(page, /Enter Passcode/);
  assert.match(page, /Incorrect passcode/);
  assert.doesNotMatch(page, /Unlock Sound Objects|unlock-button/);
  assert.match(page, /type Phase = "checking" \| "locked" \| "passcode" \| "home"/);
  assert.match(page, /useState<Phase>\("checking"\)/);
  assert.match(page, /const unlockStorageKey = "sound-objects-unlocked-v1"/);
  assert.match(page, /localStorage\.getItem\(unlockStorageKey\) === "1"/);
  assert.match(page, /localStorage\.setItem\(unlockStorageKey, "1"\)/);
  assert.match(page, /localStorage\.removeItem\(unlockStorageKey\)/);
  assert.match(page, /aria-label="Lock Sound Objects"/);
  assert.match(page, /lockScreenOpenRef\.current\?\.focus\(\)/);
  assert.doesNotMatch(page, /sessionStorage|sessionKey|session-gate/);
  assert.match(page, /onPointerDown/);
  assert.match(page, /onPointerUp/);
  assert.match(page, /startY - clientY >= 42/);
  assert.match(page, /event\.key === "Backspace"/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /event\.key === "Tab"/);
  assert.match(page, /querySelectorAll<HTMLButtonElement>/);
  assert.match(page, /role="group"/);
  assert.match(page, /wrongPasscodeTimerRef/);
  assert.match(page, /setPasscode\(nextPasscode\)[\s\S]*?setTimeout\([\s\S]*?, 340\)/);
  assert.match(page, /passcode-status-time/);
  assert.match(page, /Cancel/);
  assert.match(page, /Delete/);
  assert.doesNotMatch(page, /firstKeyRef/);
  assert.doesNotMatch(page, /lock-orbit/);
  assert.match(page, /!seedMemberIds\.has\(work\.id\)/);
  assert.match(page, /Open SEED series/);
  assert.match(page, /webInstruments\.map/);
  assert.match(page, /Open " \+ instrument\.title/);
  assert.match(page, /data-instrument=\{instrument\.id\}/);
  assert.doesNotMatch(page + detailView + webInstrumentView, /next\/link|<Link\b/);
  assert.match(webInstrumentData, /id:\s*"imagescansound"/);
  assert.match(webInstrumentData, /href:\s*"\/instruments\/imagescansound"/);
  assert.match(webInstrumentData, /embedSrc:\s*"\/web-instruments\/imagescansound\/index\.html"/);
  assert.match(webInstrumentData, /iconSrc:\s*"\/media\/imagescansound-icon\.svg"/);
  assert.match(webInstrumentData, /10cb78e9d07e6a6e9935f1a08873b5caf67a6ad7/);
  assert.match(webInstrumentData, /id:\s*"orbitonic"/);
  assert.match(webInstrumentData, /href:\s*"\/instruments\/orbitonic"/);
  assert.match(webInstrumentData, /embedSrc:\s*"\/web-instruments\/orbitonic\/index\.html"/);
  assert.match(webInstrumentData, /iconSrc:\s*"\/media\/orbitonic-icon\.svg"/);
  assert.match(webInstrumentData, /9ce5406c5eb732aa63ab1e0228f6f985917fad87/);
  assert.match(webInstrumentView, /<iframe/);
  assert.match(webInstrumentView, /allow="autoplay; web-share; screen-wake-lock"/);
  assert.match(webInstrumentView, /target="_blank"/);
  assert.match(webInstrumentView, /rel="noopener noreferrer"/);
  assert.match(
    webInstrumentView,
    /sandbox="allow-scripts allow-downloads allow-popups allow-same-origin"/,
  );
  assert.match(webInstrumentStyles, /position:\s*fixed/);
  assert.match(webInstrumentStyles, /grid-template-rows:\s*auto minmax\(0, 1fr\)/);
  assert.match(webInstrumentStyles, /min-height:\s*44px/);
  assert.match(webInstrumentStyles, /\.backLink\s*\{[\s\S]*?background:\s*transparent/);
  assert.match(webInstrumentStyles, /prefers-reduced-motion:\s*reduce/);
  assert.match(pluginData, /name:\s*"DriftField"[\s\S]*?detailHref:\s*"\/plugins\/driftfield"/);
  const seedSeriesSource =
    pluginData.match(/export const seedSeries[\s\S]*?\n\} as const;/)?.[0] ?? "";
  assert.match(seedSeriesSource, /name:\s*"DriftField"/);
  assert.doesNotMatch(
    seedSeriesSource,
    /SEED application icon|Ecosystem Drums|COLONY|Persistent Spectral|Flower Groove|GrainTime/,
  );
  assert.match(page, /hidden=\{!active\}/);
  assert.match(page, /inert=\{!active\}/);
  assert.match(page, /href=\{work\.detailHref \?\? "\/"\}/);
  assert.doesNotMatch(page, /ArchiveExperience|openArchive|home-dock|sectionFromHash/);
  assert.doesNotMatch(page + styles, /release-widget/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /background:\s*var\(--acid\)/);
  assert.match(styles, /--paper:\s*#ffffff/);
  assert.match(styles, /\.plugin-home\s*\{[\s\S]*?background:\s*var\(--paper\)/);
  assert.match(styles, /\.home-lock-button\s*\{[\s\S]*?min-height:\s*44px/);
  assert.doesNotMatch(styles, /\.plugin-home::before/);
  assert.match(styles, /border-radius:\s*43px/);
  assert.match(styles, /\.lock-screen\s*\{[\s\S]*?background:\s*var\(--paper\)/);
  assert.match(styles, /\.passcode-screen/);
  assert.match(styles, /\.lock-glyph/);
  assert.match(styles, /\.open-passcode/);
  assert.match(styles, /\.passcode-actions/);
  assert.match(styles, /\.passcode-status-time/);
  assert.match(styles, /@keyframes passcode-shake/);
  assert.doesNotMatch(styles, /\.lock-orbit|\.session-gate/);
  assert.match(styles, /\.plugin-apps/);
  assert.match(styles, /\.passcode-keypad/);
  assert.match(styles, /\.home-title\s*\{[\s\S]*?clip:\s*rect\(0 0 0 0\)/);
  assert.match(styles, /\.mode-pane\[hidden\]/);
  assert.doesNotMatch(layout, /codex-preview|_sites-preview/);
  assert.match(pluginData, /detailHref:\s*"\/plugins\/driftfield"/);
  assert.match(pluginData, /detailHref:\s*"\/plugins\/bugnote-3"/);
  assert.ok((pluginData.match(/availability:\s*"pending"/g) ?? []).length >= 1);
  assert.match(
    pluginData,
    /id:\s*"bugnote-3-macos-universal-2"[\s\S]*?availability:\s*"pending"[\s\S]*?href:\s*null/,
  );
  assert.match(
    pluginData,
    /id:\s*"driftfield-macos-universal-2"[\s\S]*?availability:\s*"pending"[\s\S]*?href:\s*null/,
  );
  assert.doesNotMatch(pluginData, /macOS11-candidate\.zip|Friend-Test\.zip/);
  assert.match(pluginData, /previousVersions:\s*\[/);
  assert.match(pluginData, /id:\s*"bugnote-v0-4-2"/);
  assert.match(detailView, /plugin\.previousVersions\?\.length/);
  assert.match(detailView, />Previous version</);
  assert.match(detailView, /download\.availability !== "pending"/);
  assert.match(detailView, /data-download-link/);
  assert.match(detailView, /Test build/);
  assert.match(detailView, /Download for macOS/);
  assert.match(detailView, /download\.delivery === "same-origin-file"/);
  assert.match(detailView, /target=\{/);
  assert.match(detailView, /rel=\{/);
  assert.match(detailView, /plugin\.videos\.map/);
  assert.match(detailView, /video\.width/);
  assert.match(detailView, /video\.height/);
  assert.match(detailView, />Film<\/h2>/);
  assert.match(detailView, /playsInline/);
  assert.match(detailView, /preload="metadata"/);
  assert.match(detailView, /tabIndex=\{0\}/);
  assert.match(detailStyles, /overflow-y:\s*auto/);
  assert.match(detailStyles, /object-fit:\s*contain/);
  assert.match(detailStyles, /\.scroll:focus-visible/);
  assert.match(detailStyles, /\.downloadLink:focus-visible/);
  assert.match(detailStyles, /min-height:\s*44px/);
  assert.match(detailStyles, /\.candidateBadge/);
  assert.match(detailStyles, /\.candidateNote/);
  assert.match(detailStyles, /\.checksum summary:focus-visible/);
  assert.doesNotMatch(page + pluginData + detailView, /[ぁ-んァ-ヶ一-龠々ー]/);

  await Promise.all([
    access(
      new URL(
        "../public/media/driftfield-icon-tactile-splice.png",
        import.meta.url,
      ),
    ),
    access(new URL("../public/media/driftfield-interface.jpg", import.meta.url)),
    access(
      new URL(
        "../public/media/driftfield-interface-recording.mp4",
        import.meta.url,
      ),
    ),
    access(
      new URL(
        "../public/media/driftfield-interface-recording-poster.jpg",
        import.meta.url,
      ),
    ),
    access(
      new URL(
        "../public/media/driftfield-interface-recording-en.vtt",
        import.meta.url,
      ),
    ),
    access(new URL("../public/media/bugnote-3-ui.jpg", import.meta.url)),
    access(new URL("../public/media/bugnote-3-icon.png", import.meta.url)),
    access(new URL("../public/media/bugnote-legacy-icon.png", import.meta.url)),
    access(new URL("../public/media/bugnote-interface-recording.mp4", import.meta.url)),
    access(
      new URL(
        "../public/media/bugnote-interface-recording-poster.jpg",
        import.meta.url,
      ),
    ),
    access(
      new URL(
        "../public/media/bugnote-interface-recording-en.vtt",
        import.meta.url,
      ),
    ),
    access(new URL("../public/web-instruments/imagescansound/index.html", import.meta.url)),
    access(new URL("../public/web-instruments/imagescansound/styles.css", import.meta.url)),
    access(new URL("../public/web-instruments/imagescansound/app.js", import.meta.url)),
    access(new URL("../public/web-instruments/orbitonic/index.html", import.meta.url)),
    access(new URL("../public/web-instruments/orbitonic/styles.css", import.meta.url)),
    access(new URL("../public/web-instruments/orbitonic/app.js", import.meta.url)),
    access(new URL("../public/media/imagescansound-app.png", import.meta.url)),
    access(new URL("../public/media/orbitonic-app.png", import.meta.url)),
  ]);

  const bugnoteIcon = await stat(new URL("../public/media/bugnote-3-icon.png", import.meta.url));
  assert.ok(bugnoteIcon.size < 200_000, "bugnote icon should stay lightweight");
  const legacyBugnoteIcon = await stat(
    new URL("../public/media/bugnote-legacy-icon.png", import.meta.url),
  );
  assert.ok(
    legacyBugnoteIcon.size < 200_000,
    "legacy bugnote icon should stay lightweight",
  );
  const legacyBugnoteVideoUrl = new URL(
    "../public/media/bugnote-interface-recording.mp4",
    import.meta.url,
  );
  const legacyBugnoteVideo = await stat(legacyBugnoteVideoUrl);
  assert.equal(legacyBugnoteVideo.size, 7_876_857);
  assert.ok(
    legacyBugnoteVideo.size < 10_000_000,
    "legacy bugnote video should stay below the static-hosting file limit",
  );
  const legacyBugnoteVideoBytes = await readFile(legacyBugnoteVideoUrl);
  assert.equal(
    createHash("sha256").update(legacyBugnoteVideoBytes).digest("hex"),
    "b890887e9bf80bdf05885b032e58d9b0fd545e88e0a78a3b6953546af2a34022",
  );
  const driftFieldIconUrl = new URL(
    "../public/media/driftfield-icon-tactile-splice.png",
    import.meta.url,
  );
  const driftFieldIcon = await stat(driftFieldIconUrl);
  assert.ok(driftFieldIcon.size < 200_000, "DriftField icon should stay lightweight");
  const driftFieldIconBytes = await readFile(driftFieldIconUrl);
  assert.equal(
    createHash("sha256").update(driftFieldIconBytes).digest("hex"),
    "12d7be029dbad8eca176e0603ddc805858ec426b5875b5ac7085722bf8a76c3a",
  );
  const driftFieldInterfaceUrl = new URL(
    "../public/media/driftfield-interface.jpg",
    import.meta.url,
  );
  const driftFieldInterface = await stat(driftFieldInterfaceUrl);
  assert.equal(driftFieldInterface.size, 65_934);
  assert.ok(
    driftFieldInterface.size < 200_000,
    "DriftField interface screenshot should stay lightweight",
  );
  const driftFieldInterfaceBytes = await readFile(driftFieldInterfaceUrl);
  assert.equal(
    createHash("sha256").update(driftFieldInterfaceBytes).digest("hex"),
    "c2dcc2d65adf0902307bbad770c090777e888843be10a09759d273025d7e7119",
  );
  const driftFieldVideoUrl = new URL(
    "../public/media/driftfield-interface-recording.mp4",
    import.meta.url,
  );
  const driftFieldVideo = await stat(driftFieldVideoUrl);
  assert.equal(driftFieldVideo.size, 9_236_331);
  assert.ok(
    driftFieldVideo.size < 10_000_000,
    "DriftField video should stay below the static-hosting file limit",
  );
  const driftFieldVideoBytes = await readFile(driftFieldVideoUrl);
  assert.equal(
    createHash("sha256").update(driftFieldVideoBytes).digest("hex"),
    "79cb1d134e19e1362d5ea6572fb51c6a0f0acab3dc3134ee830ff2c539c37701",
  );
  const driftFieldPosterUrl = new URL(
    "../public/media/driftfield-interface-recording-poster.jpg",
    import.meta.url,
  );
  const driftFieldPoster = await stat(driftFieldPosterUrl);
  assert.equal(driftFieldPoster.size, 79_341);
  assert.ok(driftFieldPoster.size < 200_000, "DriftField poster should stay lightweight");
  const driftFieldPosterBytes = await readFile(driftFieldPosterUrl);
  assert.equal(
    createHash("sha256").update(driftFieldPosterBytes).digest("hex"),
    "fd6c55a68f9d1aec80984c845b96dc5916054fd958c76505332756624c47f2fb",
  );
  const driftFieldCaptions = await readFile(
    new URL(
      "../public/media/driftfield-interface-recording-en.vtt",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(driftFieldCaptions, /^WEBVTT/);
  assert.match(driftFieldCaptions, /DriftField interface and generated audio/);

  await assert.rejects(
    access(
      new URL(
        "../public/downloads/bugnote-3-v3.0.1-macOS-Universal-2-macOS11-candidate.zip",
        import.meta.url,
      ),
    ),
    (error) => error?.code === "ENOENT",
  );
  await assert.rejects(
    access(
      new URL(
        "../public/downloads/DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
        import.meta.url,
      ),
    ),
    (error) => error?.code === "ENOENT",
  );
});
