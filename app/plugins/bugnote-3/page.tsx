import type { Metadata } from "next";
import { PluginDetailView } from "../../_components/plugin-detail-view";
import { bugnote3 } from "../../_data/plugins";

const canonicalUrl = "https://voboku.com/plugins/bugnote-3/";
const socialImage = "https://voboku.com" + bugnote3.interfaceImage;

export const metadata: Metadata = {
  title: bugnote3.title + " — Sound Objects",
  description: bugnote3.description,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: bugnote3.title + " — Sound Objects",
    description: bugnote3.description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: bugnote3.interfaceWidth,
        height: bugnote3.interfaceHeight,
        alt: bugnote3.interfaceAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: bugnote3.title + " — Sound Objects",
    description: bugnote3.description,
    images: [socialImage],
  },
};

export default function Bugnote3Page() {
  return <PluginDetailView plugin={bugnote3} />;
}
