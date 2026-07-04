import type { Metadata } from "next";
import { TemplatesPage } from "@/modules/templates-editor/TemplatesPage";

export const metadata: Metadata = {
  title: "Templates | Ikisha",
  description: "Preview and edit Ikisha portfolio templates. Layout stays locked; update copy and images only."
};

export default function TemplatesRoute() {
  return <TemplatesPage />;
}
