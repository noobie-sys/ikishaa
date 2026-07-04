"use client";

import Image from "next/image";

export function EditorImage({
  src,
  alt,
  className = "object-cover",
  sizes,
  priority = false
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className}`} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
