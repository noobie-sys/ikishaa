import type { EditorialStripContent } from "@/types/editorialStrip";
import type { MonoCollageContent } from "@/types/monoCollage";
import type { PageContent, Section } from "@/types/page";

export function firstTextSectionIndex(sections: Section[]): number {
  return sections.findIndex((section) => section.type === "text");
}

export function isMonoCollageContent(content: PageContent): content is MonoCollageContent {
  return typeof content === "object" && content !== null && "kind" in content && content.kind === "mono-collage";
}

export function isEditorialStripContent(content: PageContent): content is EditorialStripContent {
  return typeof content === "object" && content !== null && "kind" in content && content.kind === "editorial-strip";
}

export function pageDescription(content: PageContent): string {
  if (isEditorialStripContent(content)) {
    const first = content.slides[0];
    return `${first.line1} ${first.line2}`.slice(0, 155);
  }
  if (isMonoCollageContent(content)) {
    return content.caption.slice(0, 155);
  }
  const firstText = content.sections.find((section) => section.type === "text");
  return firstText?.type === "text" ? firstText.content.slice(0, 155) : "Portfolio page";
}
