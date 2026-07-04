"use client";

import { useState } from "react";
import { TemplateText } from "@/components/template-fields/TemplateText";
import { Carousel } from "@/sections/carousel/Carousel";
import { Gallery } from "@/sections/gallery/Gallery";
import { TextBlock } from "@/sections/text/TextBlock";
import { firstTextSectionIndex } from "@/lib/pageContent";
import type { MinimalGridChrome } from "@/modules/templates-editor/types";
import type { MinimalGridPageContent } from "@/types/page";
import { minimalGridConfig as cfg } from "./config";

type MinimalGridTemplateProps = {
  content: MinimalGridPageContent;
  chrome?: MinimalGridChrome;
  onContentChange?: (content: MinimalGridPageContent) => void;
  onChromeChange?: (chrome: MinimalGridChrome) => void;
  onLocalPreview?: () => void;
};

export function MinimalGridTemplate({
  content,
  chrome,
  onContentChange,
  onChromeChange,
  onLocalPreview
}: MinimalGridTemplateProps) {
  const [localPreviewNotice, setLocalPreviewNotice] = useState(false);
  const editing = Boolean(onContentChange);
  const heroIndex = firstTextSectionIndex(content.sections);
  const heroSection = heroIndex >= 0 && content.sections[heroIndex]?.type === "text" ? content.sections[heroIndex] : null;
  const asideLabel = chrome?.asideLabel ?? "Portfolio";

  function updateText(sectionIndex: number, text: string) {
    onContentChange?.({
      ...content,
      sections: content.sections.map((section, index) =>
        index === sectionIndex && section.type === "text" ? { ...section, content: text } : section
      )
    });
  }

  function updateGallery(sectionIndex: number, imageIndex: number, patch: { url?: string; alt?: string }) {
    onContentChange?.({
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
    });
  }

  function updateCarousel(sectionIndex: number, itemIndex: number, url: string) {
    onContentChange?.({
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
    });
  }

  function handleLocalPreview() {
    setLocalPreviewNotice(true);
    onLocalPreview?.();
  }

  return (
    <main className={`${cfg.theme.background} ${cfg.theme.foreground} ${cfg.layout.shell}`}>
      {editing && localPreviewNotice ? (
        <p className="mx-auto mb-6 max-w-7xl border border-[#d8d0c4] bg-[#fbf8f2] px-4 py-3 text-sm text-[#625d55]">
          Image saved locally for preview. Sign in to upload to your media library and use HTTPS URLs on published pages.
        </p>
      ) : null}

      <div className={cfg.layout.main}>
        <aside className={cfg.layout.aside}>
          <TemplateText
            value={asideLabel}
            label="aside label"
            className="mb-4 text-xs uppercase tracking-[0.22em] text-[#8e877c]"
            maxLength={80}
            onChange={
              editing && onChromeChange
                ? (asideLabelValue) => onChromeChange({ asideLabel: asideLabelValue })
                : undefined
            }
          />
          {heroSection ? (
            <TemplateText
              value={heroSection.content}
              label="hero heading"
              className={cfg.typography.title}
              multiline
              onChange={editing ? (text) => updateText(heroIndex, text) : undefined}
            />
          ) : (
            <h1 className={cfg.typography.title}>Selected Work</h1>
          )}
        </aside>

        <div className={cfg.layout.content}>
          {content.sections.map((section, index) => {
            if (index === heroIndex && section.type === "text") {
              return null;
            }
            if (section.type === "text") {
              return (
                <TextBlock
                  key={index}
                  section={section}
                  className={cfg.typography.text}
                  editing={
                    editing
                      ? {
                          label: `text block ${index + 1}`,
                          onChange: (text) => updateText(index, text)
                        }
                      : undefined
                  }
                />
              );
            }
            if (section.type === "gallery") {
              return (
                <Gallery
                  key={index}
                  section={section}
                  density={section.layout === "grid" ? "grid" : "stack"}
                  editing={
                    editing
                      ? {
                          onImageUrlChange: (imageIndex, url) => updateGallery(index, imageIndex, { url }),
                          onImageAltChange: (imageIndex, alt) => updateGallery(index, imageIndex, { alt }),
                          onLocalPreview: handleLocalPreview
                        }
                      : undefined
                  }
                />
              );
            }
            return (
              <Carousel
                key={index}
                section={section}
                editing={
                  editing
                    ? {
                        onItemUrlChange: (itemIndex, url) => updateCarousel(index, itemIndex, url),
                        onLocalPreview: handleLocalPreview
                      }
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
