import type { Metadata } from "next";
import { PageRenderer } from "@/modules/page-renderer/PageRenderer";
import { monoCollageDemoPublicPage } from "@/modules/demo/monoCollageDemoContent";

export const metadata: Metadata = {
  title: "Mono Collage Demo | Ikisha",
  description: "Development demo of the Mono Collage portfolio template with monochrome editorial layout."
};

export default function MonoCollageDemoPage() {
  return <PageRenderer page={monoCollageDemoPublicPage} />;
}
