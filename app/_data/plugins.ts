export type PluginVideo = {
  id: string;
  src: string;
  poster: string;
  mimeType: string;
  title: string;
  captions: string;
  width: number;
  height: number;
};

export type SamplePack = {
  id: string;
  title: string;
  cover: string;
  href: string;
  preview?: string;
};

export type PluginTrack = {
  id: string;
  title: string;
  artwork: string;
  src: string;
  mimeType: string;
};

export type PluginFact = {
  label: string;
  value: string;
};

export type PreviousPluginVersion = {
  id: string;
  title: string;
  version: string;
  description: string;
  image: string;
  imageAlt: string;
  facts: readonly PluginFact[];
  gestures: readonly string[];
  note: string;
  video?: {
    src: string;
    poster: string;
    mimeType: string;
    title: string;
    captions: string;
    width: number;
    height: number;
  };
};

type PluginDownloadBase = {
  id: string;
  platform: "macOS" | "Windows";
  label: string;
  meta: string;
  note: string;
};

export type PluginDownload =
  | (PluginDownloadBase & {
      availability: "pending";
      href: null;
      delivery: null;
      filename: null;
      bytes: null;
      sha256: null;
    })
  | (PluginDownloadBase & {
      availability: "candidate" | "available";
      href: string;
      delivery: "same-origin-file" | "external-file" | "external-page";
      filename: string;
      bytes: number;
      sha256: string;
    });

export type PluginDetail = {
  slug: string;
  archiveSection: string;
  title: string;
  version: string;
  description: string;
  statusNote?: string;
  icon: string;
  interfaceImage: string;
  interfaceAlt: string;
  interfaceWidth: number;
  interfaceHeight: number;
  mediaPresentation: "interface" | "icon";
  accent: string;
  mediaBackground: string;
  facts: readonly PluginFact[];
  gestures: readonly string[];
  previousVersions?: readonly PreviousPluginVersion[];
  downloads: readonly PluginDownload[];
  videos: readonly PluginVideo[];
  samplePacks: readonly SamplePack[];
  tracks: readonly PluginTrack[];
};

export type SeriesMember = {
  id: string;
  name: string;
  visual: string;
  visualAlt: string;
  visualKind: "icon" | "interface";
  detailHref: string | null;
};

export const pluginWorks = [
  {
    id: "driftfield",
    name: "DriftField",
    archiveSection: "driftfield",
    src: "/media/driftfield.jpg",
    iconSrc: "/media/driftfield-icon-soft-sequence.png",
    alt: "DriftField plugin interface",
    detailHref: "/plugins/driftfield",
  },
  {
    id: "colony",
    name: "COLONY",
    archiveSection: "colony",
    src: "/media/colony.png",
    iconSrc: "/media/colony.png",
    alt: "COLONY Instrument interface",
    detailHref: null,
  },
  {
    id: "ecosystem-drums",
    name: "Ecosystem Drums",
    archiveSection: "ecosystem-drums",
    src: "/media/ecosystem-drums.jpg",
    iconSrc: "/media/ecosystem-drums.jpg",
    alt: "Ecosystem Drums interface",
    detailHref: null,
  },
  {
    id: "bugnote-3",
    name: "bugnote 3",
    archiveSection: "bugnote",
    src: "/media/bugnote.jpg",
    iconSrc: "/media/bugnote-3-icon.png",
    alt: "bugnote 3 product visual",
    detailHref: "/plugins/bugnote-3",
  },
  {
    id: "flower-groove",
    name: "Flower Groove",
    archiveSection: "flower-groove",
    src: "/media/flower-groove.png",
    iconSrc: "/media/flower-groove.png",
    alt: "Flower Groove plugin interface",
    detailHref: null,
  },
] as const;

export const seedSeries = {
  id: "seed-series",
  name: "SEED",
  href: "/series/seed",
  description:
    "DriftField is the first completed instrument in the SEED series.",
  members: [
    {
      id: "driftfield",
      name: "DriftField",
      visual: "/media/driftfield-icon-soft-sequence.png",
      visualAlt: "DriftField application icon",
      visualKind: "icon",
      detailHref: "/plugins/driftfield",
    },
  ] satisfies readonly SeriesMember[],
} as const;

export const bugnote3: PluginDetail = {
  slug: "bugnote-3",
  archiveSection: "bugnote",
  title: "bugnote 3",
  version: "v3.0.1",
  description:
    "An interactive granular instrument that maps sample fragments across 8,000 particles and turns nearby movement into sound.",
  icon: "/media/bugnote-3-icon.png",
  interfaceImage: "/media/bugnote-3-ui.jpg",
  interfaceAlt: "The particle interface of bugnote 3",
  interfaceWidth: 862,
  interfaceHeight: 588,
  mediaPresentation: "interface",
  accent: "#3f70a8",
  mediaBackground: "#6d98d5",
  facts: [
    { label: "System", value: "macOS 11 target / Universal 2" },
    { label: "Formats", value: "AU / VST3 / Standalone" },
    { label: "Particles", value: "8,000" },
    { label: "Chops", value: "128–512" },
    { label: "Voices", value: "Up to 6" },
    { label: "Grains", value: "120–220 ms" },
  ],
  gestures: ["Stretch", "Ambient", "Pitch", "Spray"],
  previousVersions: [
    {
      id: "bugnote-v0-4-2",
      title: "bugnote",
      version: "v0.4.2",
      description:
        "The earlier bugnote release line turns a loaded sound into a rotating particle cloud. Touching the cloud triggers granular slices, while Ambient Bloom creates a darker, slowly moving stereo tail.",
      image: "/media/bugnote-legacy-icon.png",
      imageAlt: "The blue and cream particle-cloud icon of bugnote",
      facts: [
        { label: "Type", value: "Instrument / Sampler" },
        { label: "Formats", value: "AU / VST3 / Standalone" },
        { label: "Sample files", value: "WAV / AIFF / MP3 / FLAC" },
        { label: "Chops", value: "128–512" },
        { label: "Long files", value: "512-fragment atlas" },
        { label: "Output", value: "24-bit WAV recording" },
      ],
      gestures: ["Stretch", "Ambient", "Pitch", "Spray"],
      note:
        "Kept here as a previous release. A separately validated v0.4.2 download package is not available yet.",
      video: {
        src: "/media/bugnote-interface-recording.mp4",
        poster: "/media/bugnote-interface-recording-poster.jpg",
        mimeType: "video/mp4",
        title: "bugnote interface and sound demonstration",
        captions: "/media/bugnote-interface-recording-en.vtt",
        width: 960,
        height: 664,
      },
    },
  ],
  downloads: [
    {
      id: "bugnote-3-macos-universal-2",
      platform: "macOS",
      label: "macOS Universal 2",
      meta:
        "v3.0.1 · macOS 11 target · Universal 2 · AU / VST3 / Standalone · 22.6 MB ZIP",
      note:
        "On some Macs, downloading, opening, or adding this test build to a DAW may be difficult. If it does not open or appear in your DAW, wait for a later build.",
      availability: "candidate",
      href:
        "https://github.com/voboku/voboku.com/releases/download/test-builds-2026-09-03/bugnote-3-v3.0.1-macOS-Universal-2-Public-Test.zip",
      delivery: "external-file",
      filename:
        "bugnote-3-v3.0.1-macOS-Universal-2-Public-Test.zip",
      bytes: 22_590_104,
      sha256:
        "c45cd362f8ce6eb26f07a8333cdff66c40c161ee2de6d859e0704cc279297094",
    },
  ],
  // Add user-authored media here when it is ready. Large video/audio `src`
  // values may be absolute CDN URLs; keep those binaries out of the site repo.
  // Empty collections are not rendered, so unfinished cards never appear.
  videos: [] as readonly PluginVideo[],
  samplePacks: [] as readonly SamplePack[],
  tracks: [] as readonly PluginTrack[],
};

export const driftField: PluginDetail = {
  slug: "driftfield",
  archiveSection: "driftfield",
  title: "DriftField",
  version: "v0.5.1 · CURRENT DEVELOPMENT",
  description:
    "A random MIDI sample chopper that turns a bank of sounds into deterministic slices, relationships and evolving movement.",
  statusNote:
    "This page reflects the current borderless 0.5.1 interface and Soft Sequence identity.",
  icon: "/media/driftfield-icon-soft-sequence.png",
  interfaceImage: "/media/driftfield-interface-current.png",
  interfaceAlt:
    "The current borderless DriftField interface with sample cells and relationship field",
  interfaceWidth: 1040,
  interfaceHeight: 680,
  mediaPresentation: "interface",
  accent: "#277a72",
  mediaBackground: "#f6efe4",
  facts: [
    { label: "System", value: "macOS 12+ / Windows x64" },
    { label: "Current build", value: "0.5.1 development" },
    { label: "Samples", value: "Up to 64" },
    { label: "Voices", value: "32" },
    { label: "Per sample", value: "MUTE / REMOVE" },
    { label: "Pitch", value: "KEY / FIXED" },
  ],
  gestures: ["Growth", "MATCH", "FRESH", "GLUE", "Decay"],
  downloads: [
    {
      id: "driftfield-macos-universal-2",
      platform: "macOS",
      label: "macOS Universal 2 · VST3",
      meta:
        "v0.5.1 · macOS 12+ · Universal 2 · VST3 · 9.7 MB ZIP",
      note:
        "On some Macs, downloading, opening, or adding this test build to a DAW may be difficult. If it does not open or appear in your DAW, wait for a later build.",
      availability: "candidate",
      href:
        "https://github.com/voboku/voboku.com/releases/download/test-builds-2026-09-03/DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
      delivery: "external-file",
      filename: "DriftField-0.5.1-macOS-Universal-VST3-Friend-Test.zip",
      bytes: 9_681_335,
      sha256:
        "4491467eb556b885752e55df3a89589d76ee66463b4712b861b911ed2ba796e8",
    },
    {
      id: "driftfield-windows-x64",
      platform: "Windows",
      label: "Windows x64 · VST3",
      meta: "v0.5.1 · Windows x64 · VST3 · 3.5 MB ZIP",
      note:
        "This cross-build has not yet been tested on Windows. Downloading, extracting, or adding it to a DAW may be difficult. If it does not open or appear, wait for a later build.",
      availability: "candidate",
      href:
        "https://github.com/voboku/voboku.com/releases/download/test-builds-2026-09-03/DriftField-0.5.1-Windows-x64-VST3-Friend-Test-CrossBuild.zip",
      delivery: "external-file",
      filename: "DriftField-0.5.1-Windows-x64-VST3-Friend-Test-CrossBuild.zip",
      bytes: 3_506_164,
      sha256:
        "614c41aae466747dc3315033bf123ab448ec533b4831e1750d4d247a021b4084",
    },
  ],
  videos: [],
  previousVersions: [
    {
      id: "driftfield-v0-5-1-tactile-splice",
      title: "DriftField",
      version: "v0.5.1 · Tactile Splice UI",
      description:
        "The earlier 0.5.1 development presentation used the tactile linked-sample icon and a framed colony interface. Its film remains here as a record of that stage.",
      image: "/media/driftfield-icon-tactile-splice.png",
      imageAlt: "The earlier Tactile Splice icon for DriftField",
      facts: [
        { label: "System", value: "macOS 12+ / Universal 2" },
        { label: "Build", value: "VST3 friend test" },
        { label: "Samples", value: "Up to 64" },
        { label: "Voices", value: "32" },
        { label: "Pitch", value: "KEY / FIXED" },
        { label: "Presets", value: "6" },
      ],
      gestures: ["Growth", "MATCH", "FRESH", "GLUE", "Decay"],
      note:
        "This development build is preserved for context and is not available as a public download.",
      video: {
        src: "/media/driftfield-interface-recording.mp4",
        poster: "/media/driftfield-interface-recording-poster.jpg",
        mimeType: "video/mp4",
        title: "Earlier DriftField interface and sound demonstration",
        captions: "/media/driftfield-interface-recording-en.vtt",
        width: 1280,
        height: 856,
      },
    },
  ],
  samplePacks: [],
  tracks: [],
};
