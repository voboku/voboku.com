import type { Metadata } from "next";
import { PluginDetailView } from "../../_components/plugin-detail-view";
import { driftField } from "../../_data/plugins";

const canonicalUrl = "https://voboku.com/plugins/driftfield/";
const socialImage = "https://voboku.com" + driftField.interfaceImage;

export const metadata: Metadata = {
  title: driftField.title + " — Sound Objects",
  description: driftField.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: driftField.title + " — Sound Objects",
    description: driftField.description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: driftField.interfaceWidth,
        height: driftField.interfaceHeight,
        alt: driftField.interfaceAlt,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: driftField.title + " — Sound Objects",
    description: driftField.description,
    images: [socialImage],
  },
};

export default function DriftFieldPage() {
  return <PluginDetailView plugin={driftField} />;
}
