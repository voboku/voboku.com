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
    iconSrc: "/media/driftfield-icon-tactile-splice.png",
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
      visual: "/media/driftfield-icon-tactile-splice.png",
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
      label: "macOS Universal 2",
      meta:
        "v3.0.1 · macOS · Universal 2 · AU / VST3 / Standalone",
      note:
        "A public macOS build is not available yet. Please wait for the next build.",
      availability: "pending",
      href: null,
      delivery: null,
      filename: null,
      bytes: null,
      sha256: null,
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
  version: "v0.5.1 · DEVELOPMENT",
  description:
    "A random MIDI sample chopper that turns a bank of sounds into deterministic slices, relationships and evolving movement.",
  statusNote:
    "This screen recording documents the current 0.5.1 development build in use.",
  icon: "/media/driftfield-icon-tactile-splice.png",
  interfaceImage: "/media/driftfield-interface.jpg",
  interfaceAlt: "The DriftField plugin interface running inside FL Studio",
  interfaceWidth: 1280,
  interfaceHeight: 884,
  mediaPresentation: "interface",
  accent: "#277a72",
  mediaBackground: "#e8e7e0",
  facts: [
    { label: "System", value: "macOS 12+ / Universal 2" },
    { label: "Current build", value: "VST3 friend test" },
    { label: "Samples", value: "Up to 64" },
    { label: "Voices", value: "32" },
    { label: "Pitch", value: "KEY / FIXED" },
    { label: "Presets", value: "6" },
  ],
  gestures: ["Growth", "MATCH", "FRESH", "GLUE", "Decay"],
  downloads: [
    {
      id: "driftfield-macos-universal-2",
      label: "macOS Universal 2 · VST3",
      meta:
        "v0.5.1 · macOS 12+ · Universal 2 · VST3",
      note:
        "The current friend-test build is not available for public download. Please wait for the next build.",
      availability: "pending",
      href: null,
      delivery: null,
      filename: null,
      bytes: null,
      sha256: null,
    },
  ],
  videos: [
    {
      id: "driftfield-interface-recording",
      src: "/media/driftfield-interface-recording.mp4",
      poster: "/media/driftfield-interface-recording-poster.jpg",
      mimeType: "video/mp4",
      title: "DriftField interface and sound demonstration",
      captions: "/media/driftfield-interface-recording-en.vtt",
      width: 1280,
      height: 856,
    },
  ],
  samplePacks: [],
  tracks: [],
};
