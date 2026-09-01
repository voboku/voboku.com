import type { Metadata } from "next";
import { WebInstrumentView } from "../../_components/web-instrument-view";
import { getWebInstrument } from "../../_data/web-instruments";

const instrument = getWebInstrument("orbitonic");

export const metadata: Metadata = {
  title: "orbitonic — Sound Objects",
  description: instrument.description,
  alternates: { canonical: "https://voboku.com/instruments/orbitonic/" },
  openGraph: {
    title: "orbitonic — Sound Objects",
    description: instrument.description,
    url: "https://voboku.com/instruments/orbitonic/",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "orbitonic — Sound Objects",
    description: instrument.description,
    images: [],
  },
};

export default function OrbitonicPage() {
  return <WebInstrumentView instrument={instrument} />;
}
