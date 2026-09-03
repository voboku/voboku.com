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
  assert.equal((html.match(/class="plugin-app(?: [^"]+)?"/g) ?? []).length, 3);
  assert.match(html, /\/media\/driftfield-icon-soft-sequence\.png/);
  assert.match(html, /\/media\/bugnote-3-icon\.png/);
  assert.doesNotMatch(html, /href="\/plugins\/driftfield"/);
  assert.match(html, /href="\/plugins\/bugnote-3"/);
  assert.match(html, /href="\/series\/seed"/);
  assert.match(html, /Open SEED series/);
  assert.match(html, /href="\/applications"/);
  assert.match(html, /Open web applications/);
  assert.match(html, /<span>Web Applications<\/span>/);
  assert.doesNotMatch(html, /href="\/instruments\/(?:imagescansound|orbitonic)"/);
  assert.doesNotMatch(html, /<span>\s*(?:imagescansound|orbitonic)\s*<\/span>/);
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

test("server-renders the web applications as one textless collection", async () => {
  const response = await render("/applications");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Web Applications — Sound Objects<\/title>/);
  assert.match(html, /aria-label="Web applications"/);
  assert.match(html, /aria-label="Choose a web application"/);
  assert.match(html, /Back to Sound Objects/);
  assert.match(html, /href="\/instruments\/imagescansound"/);
  assert.match(html, /href="\/instruments\/orbitonic"/);
  assert.match(html, /Open imagescansound/);
  assert.match(html, /Open orbitonic/);
  assert.match(html, /\/media\/imagescansound-icon\.svg/);
  assert.match(html, /\/media\/orbitonic-icon\.svg/);
  assert.doesNotMatch(html, />\s*(?:imagescansound|orbitonic)\s*</);

  const exportedHtml = await readFile(
    new URL("../dist/client/applications.html", import.meta.url),
    "utf8",
  );
  assert.match(
    exportedHtml,
    /<link rel="canonical" href="https:\/\/voboku\.com\/applications\/"\/>/,
  );
  assert.match(exportedHtml, /href="\/instruments\/imagescansound"/);
  assert.match(exportedHtml, /href="\/instruments\/orbitonic"/);
  assert.doesNotMatch(exportedHtml, />\s*(?:imagescansound|orbitonic)\s*</);
});

test("server-renders lightweight launch screens for both web instruments", async () => {
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
      new RegExp(`href="/web-instruments/${instrument.slug}/index\\.html"`),
    );
    assert.match(
      html,
      new RegExp(`<img[^>]+src="/media/${instrument.slug}-icon\\.svg"[^>]*>`),
    );
    assert.match(
      html,
      new RegExp(
        `<button[^>]+aria-label="Launch ${instrument.title}"[^>]*>\\s*Launch\\s*</button>`,
      ),
    );
    assert.doesNotMatch(html, /<iframe\b/);
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

test("server-renders bugnote 3 with a public test download", async () => {
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
  assert.match(html, /Test build/);
  assert.match(html, /Download for macOS/);
  assert.match(html, /22\.6 MB ZIP/);
  assert.match(
    html,
    /downloading, opening, or adding this test build to a DAW may be difficult/,
  );
  assert.match(
    html,
    /href="\/downloads\/bugnote-3-v3\.0\.1-macOS-Universal-2-Public-Test\.zip"/,
  );
  assert.match(
    html,
    /download="bugnote-3-v3\.0\.1-macOS-Universal-2-Public-Test\.zip"/,
  );
  assert.match(html, /File verification/);
  assert.match(
    html,
    /c45cd362f8ce6eb26f07a8333cdff66c40c161ee2de6d859e0704cc279297094/,
  );
  assert.equal(
    (html.match(/<a\b[^>]*\bdata-download-link\b/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(html, /Preparing release|Release build in preparation/);
  assert.doesNotMatch(
    html,
    /Internal candidate|Apple-notarized|distribution rights/i,
  );
  assert.match(html, />Previous version</);
  assert.doesNotMatch(html, />Previous release</);
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

test("server-renders the current DriftField and preserves the earlier interface below", async () => {
  const response = await render("/plugins/driftfield");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>DriftField — Sound Objects<\/title>/);
  assert.match(html, /DriftField plugin page/);
  assert.match(html, /\/media\/driftfield-icon-soft-sequence\.png/);
  assert.match(html, /\/media\/driftfield-interface-current\.png/);
  assert.match(
    html,
    /current borderless DriftField interface with sample cells and relationship field/,
  );
  assert.match(html, /Back to plugin home/);
  assert.match(html, /href="\/"/);
  assert.match(html, /v0\.5\.1 · CURRENT DEVELOPMENT/);
  assert.match(html, /macOS 12\+ \/ Universal 2/);
  assert.match(html, /0\.5\.1 development/);
  assert.match(html, /Up to 64/);
  assert.match(html, /MUTE \/ REMOVE/);
  assert.match(html, /Growth/);
  assert.match(html, /MATCH/);
  assert.match(html, />Download</);
  assert.match(html, /Test build/);
  assert.match(html, /Download for macOS/);
  assert.match(html, /9\.7 MB ZIP/);
  assert.match(
    html,
    /downloading, opening, or adding this test build to a DAW may be difficult/,
  );
  assert.match(
    html,
    /href="\/downloads\/DriftField-0\.5\.1-macOS-Universal-VST3-Friend-Test\.zip"/,
  );
  assert.match(
    html,
    /download="DriftField-0\.5\.1-macOS-Universal-VST3-Friend-Test\.zip"/,
  );
  assert.match(html, /File verification/);
  assert.match(
    html,
    /4491467eb556b885752e55df3a89589d76ee66463b4712b861b911ed2ba796e8/,
  );
  assert.match(
    html,
    /current borderless 0\.5\.1 interface and Soft Sequence identity/,
  );
  assert.equal(
    (html.match(/<a\b[^>]*\bdata-download-link\b/g) ?? []).length,
    1,
  );
  assert.doesNotMatch(html, /Preparing release|Release build in preparation/);
  assert.doesNotMatch(
    html,
    /Internal candidate|Apple-notarized|distribution rights/i,
  );
  assert.match(html, />Previous version</);
  assert.match(html, /driftfield-v0-5-1-tactile-splice/);
  assert.match(html, /v0\.5\.1 · Tactile Splice UI/);
  assert.match(html, /\/media\/driftfield-icon-tactile-splice\.png/);
  assert.match(html, /earlier 0\.5\.1 development presentation/);
  assert.match(html, /not available as a public download/);
  assert.doesNotMatch(html, /bugnote-v0-4-2|bugnote-legacy-icon/);
  assert.doesNotMatch(html, /\/media\/driftfield\.jpg/);
  assert.doesNotMatch(html, />Film<\/h2>/);
  assert.equal((html.match(/<video\b/g) ?? []).length, 1);
  assert.match(html, /preload="none"/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /width="1280"/);
  assert.match(html, /height="856"/);
  assert.match(html, /poster="\/media\/driftfield-interface-recording-poster\.jpg"/);
  assert.match(html, /\/media\/driftfield-interface-recording\.mp4/);
  assert.match(html, /\/media\/driftfield-interface-recording-en\.vtt/);
  assert.match(html, /Earlier DriftField interface and sound demonstration/);
  assert.doesNotMatch(html, /<audio\b/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("exports all routes, social metadata, and public test builds", async () => {
  const [
    rootHtml,
    bugnoteHtml,
    driftFieldHtml,
    seedHtml,
    netlifyConfig,
    driftFieldVideo,
    bugnoteDownload,
    driftFieldDownload,
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
    readFile(
      new URL(
        "../dist/client/downloads/bugnote-3-v3.0.1-macOS-Universal-2-Public-Test.zip",
        import.meta.url,
      ),
    ),
    readFile(
      new URL(
        "../dist/client/downloads/DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
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
  assert.match(driftFieldHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/media\/driftfield-interface-current\.png"\/>/);
  assert.match(seedHtml, /<link rel="canonical" href="https:\/\/voboku\.com\/series\/seed\/"\/>/);
  assert.match(seedHtml, /<meta property="og:title" content="SEED Series — Sound Objects"\/>/);
  assert.match(seedHtml, /<meta property="og:image" content="https:\/\/voboku\.com\/media\/driftfield-interface-current\.png"\/>/);
  assert.match(netlifyConfig, /command\s*=\s*"npm test"/);
  assert.match(netlifyConfig, /\[build\.processing\.html\][\s\S]*pretty_urls\s*=\s*true/);
  assert.equal(bugnoteDownload.byteLength, 22_590_104);
  assert.equal(
    createHash("sha256").update(bugnoteDownload).digest("hex"),
    "c45cd362f8ce6eb26f07a8333cdff66c40c161ee2de6d859e0704cc279297094",
  );
  assert.equal(driftFieldDownload.byteLength, 9_681_335);
  assert.equal(
    createHash("sha256").update(driftFieldDownload).digest("hex"),
    "4491467eb556b885752e55df3a89589d76ee66463b4712b861b911ed2ba796e8",
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
    assert.match(
      routeHtml,
      new RegExp(
        `<button[^>]+aria-label="Launch ${instrument.slug}"[^>]*>\\s*Launch\\s*</button>`,
      ),
    );
    assert.doesNotMatch(routeHtml, /<iframe\b/);

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
  assert.match(page, /const lockPasscode = "200101"/);
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
  assert.match(page, /webApplications\.members\.map/);
  assert.match(page, /Open web applications/);
  assert.match(page, /href=\{webApplications\.href\}/);
  assert.match(page, /\{webApplications\.name\}/);
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
  assert.match(webInstrumentData, /export const webApplications/);
  assert.match(webInstrumentData, /href:\s*"\/applications"/);
  assert.match(webInstrumentData, /members:\s*webInstruments/);
  assert.match(webInstrumentView, /<iframe/);
  assert.match(webInstrumentView, /useState<"idle" \| "loading" \| "ready">/);
  assert.match(webInstrumentView, /launchPhase !== "idle"/);
  assert.match(webInstrumentView, /launchPhase !== "ready"/);
  assert.match(webInstrumentView, /onLoad=\{handleFrameLoad\}/);
  assert.match(webInstrumentView, /aria-live=\{loading \? "polite"/);
  assert.match(
    webInstrumentView,
    /aria-label=\{`Launch \$\{instrument\.title\}`\}/,
  );
  assert.match(webInstrumentView, /instrument\.iconSrc/);
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
  assert.match(webInstrumentStyles, /\.launchStage/);
  assert.match(webInstrumentStyles, /\.launchButton\s*\{[\s\S]*?min-height:\s*48px/);
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
  assert.match(styles, /\.web-applications-folder-icon/);
  assert.match(styles, /\.passcode-keypad/);
  assert.match(styles, /\.home-title\s*\{[\s\S]*?clip:\s*rect\(0 0 0 0\)/);
  assert.match(styles, /\.mode-pane\[hidden\]/);
  assert.doesNotMatch(layout, /codex-preview|_sites-preview/);
  assert.match(pluginData, /detailHref:\s*"\/plugins\/driftfield"/);
  assert.match(pluginData, /detailHref:\s*"\/plugins\/bugnote-3"/);
  assert.match(pluginData, /icon:\s*"\/media\/driftfield-icon-soft-sequence\.png"/);
  assert.match(pluginData, /interfaceImage:\s*"\/media\/driftfield-interface-current\.png"/);
  assert.match(pluginData, /id:\s*"driftfield-v0-5-1-tactile-splice"/);
  assert.match(pluginData, /image:\s*"\/media\/driftfield-icon-tactile-splice\.png"/);
  assert.match(
    pluginData,
    /id:\s*"bugnote-3-macos-universal-2"[\s\S]*?availability:\s*"candidate"[\s\S]*?href:\s*"\/downloads\/bugnote-3-v3\.0\.1-macOS-Universal-2-Public-Test\.zip"[\s\S]*?bytes:\s*22_590_104[\s\S]*?c45cd362f8ce6eb26f07a8333cdff66c40c161ee2de6d859e0704cc279297094/,
  );
  assert.match(
    pluginData,
    /id:\s*"driftfield-macos-universal-2"[\s\S]*?availability:\s*"candidate"[\s\S]*?href:\s*"\/downloads\/DriftField-0\.5\.1-macOS-Universal-VST3-Friend-Test\.zip"[\s\S]*?bytes:\s*9_681_335[\s\S]*?4491467eb556b885752e55df3a89589d76ee66463b4712b861b911ed2ba796e8/,
  );
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
    access(
      new URL(
        "../public/media/driftfield-icon-soft-sequence.png",
        import.meta.url,
      ),
    ),
    access(new URL("../public/media/driftfield-interface.jpg", import.meta.url)),
    access(
      new URL("../public/media/driftfield-interface-current.png", import.meta.url),
    ),
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
  const currentDriftFieldIconUrl = new URL(
    "../public/media/driftfield-icon-soft-sequence.png",
    import.meta.url,
  );
  const currentDriftFieldIcon = await stat(currentDriftFieldIconUrl);
  assert.equal(currentDriftFieldIcon.size, 57_047);
  assert.ok(
    currentDriftFieldIcon.size < 200_000,
    "current DriftField icon should stay lightweight",
  );
  const currentDriftFieldIconBytes = await readFile(currentDriftFieldIconUrl);
  assert.equal(
    createHash("sha256").update(currentDriftFieldIconBytes).digest("hex"),
    "dd59624f908df909b44431d987c0db257b1e3c869813a0a193fa5c6fc71e0f1f",
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
  const currentDriftFieldInterfaceUrl = new URL(
    "../public/media/driftfield-interface-current.png",
    import.meta.url,
  );
  const currentDriftFieldInterface = await stat(currentDriftFieldInterfaceUrl);
  assert.equal(currentDriftFieldInterface.size, 43_557);
  assert.ok(
    currentDriftFieldInterface.size < 200_000,
    "current DriftField interface screenshot should stay lightweight",
  );
  const currentDriftFieldInterfaceBytes = await readFile(
    currentDriftFieldInterfaceUrl,
  );
  assert.equal(
    createHash("sha256").update(currentDriftFieldInterfaceBytes).digest("hex"),
    "62d837c73f8f6c22268147b5506a1e0ce53e53f73f9b5bc6706b26bbfc48cf1d",
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

  const bugnoteDownload = await readFile(
    new URL(
      "../public/downloads/bugnote-3-v3.0.1-macOS-Universal-2-Public-Test.zip",
      import.meta.url,
    ),
  );
  assert.equal(bugnoteDownload.byteLength, 22_590_104);
  assert.equal(
    createHash("sha256").update(bugnoteDownload).digest("hex"),
    "c45cd362f8ce6eb26f07a8333cdff66c40c161ee2de6d859e0704cc279297094",
  );
  const driftFieldDownload = await readFile(
    new URL(
      "../public/downloads/DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
      import.meta.url,
    ),
  );
  assert.equal(driftFieldDownload.byteLength, 9_681_335);
  assert.equal(
    createHash("sha256").update(driftFieldDownload).digest("hex"),
    "4491467eb556b885752e55df3a89589d76ee66463b4712b861b911ed2ba796e8",
  );
});
