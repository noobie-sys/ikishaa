"use client";

import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { TemplateImage } from "@/components/template-fields/TemplateImage";
import type { Section } from "@/types/page";
import { revealMotion } from "@/animations/core/reveal";

export type CarouselEditing = {
  onItemUrlChange: (itemIndex: number, url: string) => void;
  onLocalPreview?: () => void;
};

export function Carousel({
  section,
  editing
}: {
  section: Extract<Section, { type: "carousel" }>;
  editing?: CarouselEditing;
}) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });

  return (
    <motion.section {...revealMotion} className="overflow-hidden" ref={emblaRef}>
      <div className="flex touch-pan-y gap-4">
        {section.items.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className="relative aspect-[16/10] min-w-[82%] overflow-hidden bg-[#e8e0d5] sm:min-w-[58%]"
          >
            <TemplateImage
              src={item.url}
              alt=""
              label={`carousel slide ${index + 1}`}
              sizes="(min-width: 640px) 58vw, 82vw"
              className="object-cover"
              onUrlChange={editing ? (url) => editing.onItemUrlChange(index, url) : undefined}
              onLocalPreview={editing?.onLocalPreview}
            />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
