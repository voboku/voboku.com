import type { Metadata } from "next";
import { PluginDetailView } from "../../_components/plugin-detail-view";
import { harmonicTerrain } from "../../_data/plugins";

const canonicalUrl = "https://voboku.com/plugins/harmonic-terrain/";
const socialImage = "https://voboku.com" + harmonicTerrain.interfaceImage;

export const metadata: Metadata = {
  title: harmonicTerrain.title + " — Sound Objects",
  description: harmonicTerrain.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: harmonicTerrain.title + " — Sound Objects",
    description: harmonicTerrain.description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: harmonicTerrain.interfaceWidth,
        height: harmonicTerrain.interfaceHeight,
        alt: harmonicTerrain.interfaceAlt,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: harmonicTerrain.title + " — Sound Objects",
    description: harmonicTerrain.description,
    images: [socialImage],
  },
};

export default function HarmonicTerrainPage() {
  return <PluginDetailView plugin={harmonicTerrain} />;
}
