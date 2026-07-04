import type { MinimalGridPageContent } from "@/types/page";

export function updateTextSection(content: MinimalGridPageContent, sectionIndex: number, text: string): MinimalGridPageContent {
  return {
    ...content,
    sections: content.sections.map((section, index) =>
      index === sectionIndex && section.type === "text" ? { ...section, content: text } : section
    )
  };
}

export function updateGalleryImage(
  content: MinimalGridPageContent,
  sectionIndex: number,
  imageIndex: number,
  patch: Partial<{ url: string; alt: string }>
): MinimalGridPageContent {
  return {
    ...content,
    sections: content.sections.map((section, index) => {
      if (index !== sectionIndex || section.type !== "gallery") {
        return section;
      }
      return {
        ...section,
        images: section.images.map((image, idx) => (idx === imageIndex ? { ...image, ...patch } : image))
      };
    })
  };
}

export function updateCarouselItemUrl(
  content: MinimalGridPageContent,
  sectionIndex: number,
  itemIndex: number,
  url: string
): MinimalGridPageContent {
  return {
    ...content,
    sections: content.sections.map((section, index) => {
      if (index !== sectionIndex || section.type !== "carousel") {
        return section;
      }
      return {
        ...section,
        items: section.items.map((item, idx) => (idx === itemIndex ? { ...item, url } : item))
      };
    })
  };
}

export { firstTextSectionIndex } from "@/lib/pageContent";
