import type { PageContent, TemplateID } from "@/types/page";
import { isEditorialStripContent, isMonoCollageContent } from "@/lib/pageContent";
import { EditorialStripTemplate } from "@/templates/editorial-strip";
import { MinimalGridTemplate } from "@/templates/minimal-grid";
import { MonoCollageTemplate } from "@/templates/mono-collage";

export function TemplateRenderer({ template, content }: { template: TemplateID; content: PageContent }) {
  if (template === "editorial-strip" && isEditorialStripContent(content)) {
    return <EditorialStripTemplate content={content} />;
  }

  if (template === "mono-collage" && isMonoCollageContent(content)) {
    return <MonoCollageTemplate content={content} />;
  }

  if (template === "minimal-grid" && "sections" in content) {
    return <MinimalGridTemplate content={content} />;
  }

  return null;
}
