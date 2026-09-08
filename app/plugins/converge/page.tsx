import type { Metadata } from "next";
import { PluginDetailView } from "../../_components/plugin-detail-view";
import { converge } from "../../_data/plugins";

export const metadata: Metadata = {
  title: converge.title,
  description: converge.description,
  alternates: { canonical: "https://voboku.com/plugins/converge/" },
};

export default function ConvergePage() {
  return <PluginDetailView plugin={converge} />;
}
