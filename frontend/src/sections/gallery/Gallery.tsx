"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TemplateImage } from "@/components/template-fields/TemplateImage";
import type { Section } from "@/types/page";
import { revealMotion } from "@/animations/core/reveal";
import { imageHover } from "@/animations/presets/imageHover";

export type GalleryEditing = {
  onImageUrlChange: (imageIndex: number, url: string) => void;
  onImageAltChange?: (imageIndex: number, alt: string) => void;
  onLocalPreview?: () => void;
};

export function Gallery({
  section,
  density,
  editing
}: {
  section: Extract<Section, { type: "gallery" }>;
  density: "grid" | "stack";
  editing?: GalleryEditing;
}) {
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (editing) {
      return;
    }
    const cleanups = refs.current.filter(Boolean).map((element) => imageHover(element as HTMLElement));
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [editing, section.images.length]);

  const layoutClass =
    density === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" : "grid grid-cols-1 gap-5";

  return (
    <motion.section {...revealMotion} className={layoutClass}>
      {section.images.map((image, index) => (
        <div
          key={`${image.url}-${index}`}
          ref={(element) => {
            if (!editing) {
              refs.current[index] = element;
            }
          }}
          className="relative aspect-[4/5] overflow-hidden bg-[#e8e0d5]"
        >
          <TemplateImage
            src={image.url}
            alt={image.alt ?? ""}
            label={`gallery image ${index + 1}`}
            sizes={density === "grid" ? "(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw" : "100vw"}
            className="object-cover"
            priority={index < 2}
            onUrlChange={
              editing ? (url) => editing.onImageUrlChange(index, url) : undefined
            }
            onAltChange={editing?.onImageAltChange ? (alt) => editing.onImageAltChange?.(index, alt) : undefined}
            onLocalPreview={editing?.onLocalPreview}
          />
        </div>
      ))}
    </motion.section>
  );
}
