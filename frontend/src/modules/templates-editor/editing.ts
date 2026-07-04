import type { EditorialStripContent } from "@/types/editorialStrip";
import type { MonoCollageContent } from "@/types/monoCollage";
import type { MinimalGridPageContent, PageContent, TemplateID } from "@/types/page";

export type { PageContent };
import type { TemplateChrome } from "@/modules/templates-editor/types";

export type TemplateContentType = "sections" | "mono-collage" | "editorial-strip";

export type TemplateCapabilities = {
  contentType: TemplateContentType;
  /** Human-readable summary for the editor toolbar */
  summary: string;
};

export const templateCapabilities: Record<TemplateID, TemplateCapabilities> = {
  "minimal-grid": {
    contentType: "sections",
    summary: "Text and images — every section image and text block is editable"
  },
  "mono-collage": {
    contentType: "mono-collage",
    summary: "Text and images — all 5 collage images plus label and caption"
  },
  "editorial-strip": {
    contentType: "editorial-strip",
    summary: "Horizontal carousel — each slide image and two caption lines, plus header text"
  }
};

export type TemplateEditingProps<T extends TemplateID> = {
  onContentChange: (content: PageContentFor<T>) => void;
  onChromeChange?: (chrome: TemplateChrome[T]) => void;
  onLocalPreview?: () => void;
};

export type PageContentFor<T extends TemplateID> = T extends "minimal-grid"
  ? MinimalGridPageContent
  : T extends "mono-collage"
    ? MonoCollageContent
    : T extends "editorial-strip"
      ? EditorialStripContent
      : never;

export function countEditableFields(templateId: TemplateID, content: PageContent): { images: number; texts: number } {
  if (templateId === "editorial-strip" && "kind" in content && content.kind === "editorial-strip") {
    return {
      images: content.slides.length,
      texts: 3 + content.slides.length * 2
    };
  }

  if (templateId === "mono-collage" && "kind" in content && content.kind === "mono-collage") {
    return { images: Object.keys(content.images).length, texts: 2 };
  }

  if (!("sections" in content)) {
    return { images: 0, texts: 0 };
  }

  let images = 0;
  let texts = 0;
  for (const section of content.sections) {
    if (section.type === "gallery") {
      images += section.images.length;
    }
    if (section.type === "carousel") {
      images += section.items.length;
    }
    if (section.type === "text") {
      texts += 1;
    }
  }
  return { images, texts };
}
