export type WebInstrument = {
  id: "imagescansound" | "orbitonic";
  title: string;
  description: string;
  href: string;
  embedSrc: string;
  iconSrc: string;
  accent: string;
  repository: string;
  commit: string;
};

export const webInstruments = [
  {
    id: "imagescansound",
    title: "imagescansound",
    description:
      "A browser instrument that turns image structure into time, pitch and timbre.",
    href: "/instruments/imagescansound",
    embedSrc: "/web-instruments/imagescansound/index.html",
    iconSrc: "/media/imagescansound-icon.svg",
    accent: "#277a72",
    repository: "https://github.com/voboku/vq",
    commit: "10cb78e9d07e6a6e9935f1a08873b5caf67a6ad7",
  },
  {
    id: "orbitonic",
    title: "orbitonic",
    description:
      "A browser instrument that turns planetary orbits and crossings into rhythm.",
    href: "/instruments/orbitonic",
    embedSrc: "/web-instruments/orbitonic/index.html",
    iconSrc: "/media/orbitonic-icon.svg",
    accent: "#c94e32",
    repository: "https://github.com/voboku/orbit",
    commit: "9ce5406c5eb732aa63ab1e0228f6f985917fad87",
  },
] as const satisfies readonly WebInstrument[];

export const webApplications = {
  id: "web-applications",
  name: "Web Applications",
  href: "/applications",
  description: "Browser-based musical instruments and sound tools.",
  members: webInstruments,
} as const;

export function getWebInstrument(id: WebInstrument["id"]) {
  return webInstruments.find((instrument) => instrument.id === id)!;
}
