"use client";

import { useState } from "react";
import { TemplateImage } from "@/components/template-fields/TemplateImage";
import { TemplateText } from "@/components/template-fields/TemplateText";
import type { EditorialStripContent } from "@/types/editorialStrip";
import { EditorialCarousel } from "./EditorialCarousel";
import { editorialStripConfig as cfg } from "./config";

type EditorialStripTemplateProps = {
  content: EditorialStripContent;
  onContentChange?: (content: EditorialStripContent) => void;
  onLocalPreview?: () => void;
};

export function EditorialStripTemplate({ content, onContentChange, onLocalPreview }: EditorialStripTemplateProps) {
  const [localPreviewNotice, setLocalPreviewNotice] = useState(false);
  const editing = Boolean(onContentChange);

  function patch(patch: Partial<EditorialStripContent>) {
    onContentChange?.({ ...content, ...patch });
  }

  function patchHeader(headerPatch: Partial<EditorialStripContent["header"]>) {
    patch({ header: { ...content.header, ...headerPatch } });
  }

  function patchSlide(index: number, slidePatch: Partial<EditorialStripContent["slides"][number]>) {
    patch({
      slides: content.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...slidePatch } : slide))
    });
  }

  function patchSlideImage(index: number, url: string) {
    patchSlide(index, { image: { ...content.slides[index].image, url } });
  }

  function handleLocalPreview() {
    setLocalPreviewNotice(true);
    onLocalPreview?.();
  }

  return (
    <main className={`${cfg.theme.background} ${cfg.theme.foreground} ${cfg.layout.shell}`}>
      {editing && localPreviewNotice ? (
        <p className="border-b border-black/10 bg-[#ebe8e1] px-6 py-3 text-center text-xs text-black/60 sm:px-10">
          Image saved locally for preview. Sign in to upload to your media library for published pages.
        </p>
      ) : null}

      <header className={cfg.layout.header}>
        <TemplateText
          value={content.header.left}
          label="header left"
          className={cfg.layout.headerSide}
          maxLength={40}
          as="span"
          onChange={editing ? (left) => patchHeader({ left }) : undefined}
        />
        <TemplateText
          value={content.header.brand}
          label="header brand"
          className={cfg.layout.headerBrand}
          maxLength={80}
          as="span"
          onChange={editing ? (brand) => patchHeader({ brand }) : undefined}
        />
        <TemplateText
          value={content.header.right}
          label="header right"
          className={`${cfg.layout.headerSide} text-right`}
          maxLength={40}
          as="span"
          onChange={editing ? (right) => patchHeader({ right }) : undefined}
        />
      </header>

      <section className={cfg.layout.carousel} aria-label="Editorial image carousel">
        <EditorialCarousel autoplayEnabled={!editing}>
          {content.slides.map((slide, index) => (
            <article key={`${slide.image.url}-${index}`} className={cfg.layout.slide}>
              <div className={cfg.layout.image}>
                <TemplateImage
                  src={slide.image.url}
                  alt={slide.image.alt ?? ""}
                  label={`slide ${index + 1} image`}
                  sizes="(min-width: 768px) 44vw, 78vw"
                  className="object-cover"
                  priority={index < 2}
                  onUrlChange={editing ? (url) => patchSlideImage(index, url) : undefined}
                  onLocalPreview={editing ? handleLocalPreview : undefined}
                />
              </div>
              <div className={cfg.layout.caption}>
                <TemplateText
                  value={slide.line1}
                  label={`slide ${index + 1} line 1`}
                  className={cfg.layout.line1}
                  maxLength={80}
                  onChange={editing ? (line1) => patchSlide(index, { line1 }) : undefined}
                />
                <TemplateText
                  value={slide.line2}
                  label={`slide ${index + 1} line 2`}
                  className={cfg.layout.line2}
                  maxLength={120}
                  onChange={editing ? (line2) => patchSlide(index, { line2 }) : undefined}
                />
              </div>
            </article>
          ))}
        </EditorialCarousel>
      </section>
    </main>
  );
}
