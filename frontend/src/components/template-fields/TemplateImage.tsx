"use client";

import Image from "next/image";
import { EditableImageSlot } from "@/modules/templates-editor/components/EditableImageSlot";

export type TemplateImageProps = {
  src: string;
  alt?: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onUrlChange?: (url: string) => void;
  onAltChange?: (alt: string) => void;
  onLocalPreview?: () => void;
};

export function TemplateImage({
  src,
  alt = "",
  label,
  className = "object-cover",
  sizes,
  priority = false,
  onUrlChange,
  onAltChange,
  onLocalPreview
}: TemplateImageProps) {
  if (onUrlChange) {
    return (
      <EditableImageSlot
        src={src}
        alt={alt}
        label={label}
        className={className}
        sizes={sizes}
        priority={priority}
        onUrlChange={onUrlChange}
        onAltChange={onAltChange}
        onLocalPreview={onLocalPreview}
      />
    );
  }

  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />;
}
