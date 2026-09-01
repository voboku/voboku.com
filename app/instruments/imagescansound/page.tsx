import type { Metadata } from "next";
import { WebInstrumentView } from "../../_components/web-instrument-view";
import { getWebInstrument } from "../../_data/web-instruments";

const instrument = getWebInstrument("imagescansound");

export const metadata: Metadata = {
  title: "imagescansound — Sound Objects",
  description: instrument.description,
  alternates: { canonical: "https://voboku.com/instruments/imagescansound/" },
  openGraph: {
    title: "imagescansound — Sound Objects",
    description: instrument.description,
    url: "https://voboku.com/instruments/imagescansound/",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "imagescansound — Sound Objects",
    description: instrument.description,
    images: [],
  },
};

export default function ImageScanSoundPage() {
  return <WebInstrumentView instrument={instrument} />;
}
