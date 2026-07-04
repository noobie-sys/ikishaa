import type { Metadata } from "next";
import { PageRenderer } from "@/modules/page-renderer/PageRenderer";
import { editorialStripDemoPublicPage } from "@/modules/demo/editorialStripDemoContent";

export const metadata: Metadata = {
  title: "Editorial Strip Demo | Ikisha",
  description: "Development demo of the Editorial Strip carousel template with smooth horizontal motion."
};

export default function EditorialStripDemoPage() {
  return <PageRenderer page={editorialStripDemoPublicPage} />;
}
