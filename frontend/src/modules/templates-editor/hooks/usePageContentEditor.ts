"use client";

import { useCallback, useState } from "react";
import type { MinimalGridPageContent, TemplateID } from "@/types/page";
import {
  updateCarouselItemUrl,
  updateGalleryImage,
  updateTextSection
} from "@/modules/templates-editor/lib/contentUpdates";
import { getTemplateDefinition } from "@/modules/templates-editor/registry";
import type { TemplateChrome, TemplateContentMap } from "@/modules/templates-editor/types";

export function usePageContentEditor<T extends TemplateID = TemplateID>(initialTemplateId: T = "minimal-grid" as T) {
  const [activeTemplateId, setActiveTemplateId] = useState<TemplateID>(initialTemplateId);
  const definition = getTemplateDefinition(activeTemplateId);

  const [content, setContent] = useState<TemplateContentMap[typeof activeTemplateId]>(definition.defaultContent);
  const [chrome, setChrome] = useState<TemplateChrome[typeof activeTemplateId]>(definition.defaultChrome);

  const selectTemplate = useCallback((templateId: TemplateID) => {
    const next = getTemplateDefinition(templateId);
    setActiveTemplateId(templateId);
    setContent(next.defaultContent);
    setChrome(next.defaultChrome);
  }, []);

  const resetTemplate = useCallback(() => {
    setContent(definition.defaultContent);
    setChrome(definition.defaultChrome);
  }, [definition.defaultChrome, definition.defaultContent]);

  const updateText = useCallback((sectionIndex: number, text: string) => {
    if (activeTemplateId !== "minimal-grid") {
      return;
    }
    setContent((current) => updateTextSection(current as MinimalGridPageContent, sectionIndex, text));
  }, [activeTemplateId]);

  const updateGalleryImageUrl = useCallback((sectionIndex: number, imageIndex: number, url: string) => {
    if (activeTemplateId !== "minimal-grid") {
      return;
    }
    setContent((current) => updateGalleryImage(current as MinimalGridPageContent, sectionIndex, imageIndex, { url }));
  }, [activeTemplateId]);

  const updateGalleryImageAlt = useCallback((sectionIndex: number, imageIndex: number, alt: string) => {
    if (activeTemplateId !== "minimal-grid") {
      return;
    }
    setContent((current) => updateGalleryImage(current as MinimalGridPageContent, sectionIndex, imageIndex, { alt }));
  }, [activeTemplateId]);

  const updateCarouselUrl = useCallback((sectionIndex: number, itemIndex: number, url: string) => {
    if (activeTemplateId !== "minimal-grid") {
      return;
    }
    setContent((current) => updateCarouselItemUrl(current as MinimalGridPageContent, sectionIndex, itemIndex, url));
  }, [activeTemplateId]);

  const updateChrome = useCallback((nextChrome: TemplateChrome[typeof activeTemplateId]) => {
    setChrome(nextChrome);
  }, []);

  return {
    activeTemplateId,
    definition,
    content,
    chrome,
    selectTemplate,
    resetTemplate,
    setContent,
    updateText,
    updateGalleryImageUrl,
    updateGalleryImageAlt,
    updateCarouselUrl,
    updateChrome
  };
}
