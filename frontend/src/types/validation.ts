import type { EditorialStripContent } from "@/types/editorialStrip";
import { monoCollageImageKeys, type MonoCollageContent } from "@/types/monoCollage";
import type { MinimalGridPageContent, PageContent, Section, TemplateID } from "./page";

export function validatePageContent(value: unknown, template: TemplateID): value is PageContent {
  if (template === "editorial-strip") {
    return validateEditorialStripContent(value);
  }
  if (template === "mono-collage") {
    return validateMonoCollageContent(value);
  }
  return validateMinimalGridPageContent(value);
}

export function validateEditorialStripContent(value: unknown): value is EditorialStripContent {
  if (!isRecord(value) || value.version !== 1 || value.kind !== "editorial-strip") {
    return false;
  }
  if (!isRecord(value.header) || !Array.isArray(value.slides)) {
    return false;
  }
  const header = value.header;
  if (
    typeof header.left !== "string" ||
    header.left.trim().length === 0 ||
    header.left.length > 40 ||
    typeof header.brand !== "string" ||
    header.brand.trim().length === 0 ||
    header.brand.length > 80 ||
    typeof header.right !== "string" ||
    header.right.trim().length === 0 ||
    header.right.length > 40
  ) {
    return false;
  }
  if (value.slides.length < 3 || value.slides.length > 12) {
    return false;
  }
  return value.slides.every((slide) => {
    if (!isRecord(slide)) {
      return false;
    }
    if (!isRecord(slide.image) || !isHttpsURL(slide.image.url)) {
      return false;
    }
    if (slide.image.alt !== undefined && typeof slide.image.alt !== "string") {
      return false;
    }
    return (
      typeof slide.line1 === "string" &&
      slide.line1.trim().length > 0 &&
      slide.line1.length <= 80 &&
      typeof slide.line2 === "string" &&
      slide.line2.trim().length > 0 &&
      slide.line2.length <= 120
    );
  });
}

export function validateMinimalGridPageContent(value: unknown): value is MinimalGridPageContent {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.sections)) {
    return false;
  }
  if (value.sections.length === 0 || value.sections.length > 20) {
    return false;
  }
  return value.sections.every(validateSection);
}

export function validateMonoCollageContent(value: unknown): value is MonoCollageContent {
  if (!isRecord(value) || value.version !== 1 || value.kind !== "mono-collage") {
    return false;
  }
  if (!isRecord(value.images)) {
    return false;
  }
  for (const key of monoCollageImageKeys) {
    const image = value.images[key];
    if (!isRecord(image) || !isHttpsURL(image.url)) {
      return false;
    }
    if (image.alt !== undefined && typeof image.alt !== "string") {
      return false;
    }
  }
  return (
    typeof value.label === "string" &&
    value.label.trim().length > 0 &&
    value.label.length <= 120 &&
    typeof value.caption === "string" &&
    value.caption.trim().length > 0 &&
    value.caption.length <= 400
  );
}

function validateSection(section: unknown): section is Section {
  if (!isRecord(section) || typeof section.type !== "string") {
    return false;
  }
  if (section.type === "text") {
    return typeof section.content === "string" && section.content.trim().length > 0 && section.content.length <= 4000;
  }
  if (section.type === "gallery") {
    return (
      (section.layout === "grid" || section.layout === "stack") &&
      Array.isArray(section.images) &&
      section.images.length > 0 &&
      section.images.length <= 24 &&
      section.images.every((image) => isRecord(image) && isHttpsURL(image.url) && optionalString(image.alt))
    );
  }
  if (section.type === "carousel") {
    return (
      Array.isArray(section.items) &&
      section.items.length > 0 &&
      section.items.length <= 20 &&
      section.items.every((item) => isRecord(item) && isHttpsURL(item.url))
    );
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isHttpsURL(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
