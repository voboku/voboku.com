import type { Metadata } from "next";
import { PluginDetailView } from "../../_components/plugin-detail-view";
import { orbitonic } from "../../_data/plugins";

const canonicalUrl = "https://voboku.com/plugins/orbitonic/";
const socialImage = "https://voboku.com" + orbitonic.interfaceImage;

export const metadata: Metadata = {
  title: orbitonic.title + " — Sound Objects",
  description: orbitonic.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: orbitonic.title + " — Sound Objects",
    description: orbitonic.description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: orbitonic.interfaceWidth,
        height: orbitonic.interfaceHeight,
        alt: orbitonic.interfaceAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: orbitonic.title + " — Sound Objects",
    description: orbitonic.description,
    images: [socialImage],
  },
};

export default function OrbitonicPage() {
  return <PluginDetailView plugin={orbitonic} />;
}
