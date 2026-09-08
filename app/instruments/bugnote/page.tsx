import type { Metadata } from "next";
import { WebInstrumentView } from "../../_components/web-instrument-view";
import { getWebInstrument } from "../../_data/web-instruments";

const instrument = getWebInstrument("bugnote");

export const metadata: Metadata = {
  title: "bugnote",
  alternates: { canonical: "https://voboku.com/instruments/bugnote/" },
};

export default function BugnotePage() {
  return <WebInstrumentView instrument={instrument} />;
}
