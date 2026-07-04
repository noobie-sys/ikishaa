"use client";

import { useId, useRef, useState } from "react";
import { EditorImage } from "@/modules/templates-editor/components/EditorImage";
import { uploadMediaFile } from "@/modules/templates-editor/lib/uploadMedia";

type EditableImageSlotProps = {
  src: string;
  alt: string;
  onUrlChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
  className?: string;
  sizes?: string;
  priority?: boolean;
  label: string;
  onLocalPreview?: () => void;
};

export function EditableImageSlot({
  src,
  alt,
  onUrlChange,
  onAltChange,
  className = "object-cover",
  sizes,
  priority = false,
  label,
  onLocalPreview
}: EditableImageSlotProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const result = await uploadMediaFile(file);
      onUrlChange(result.url);
      if (result.localOnly) {
        onLocalPreview?.();
      }
    } catch {
      setError("Upload failed. Try again or sign in to save images to your library.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="group relative h-full w-full">
      <EditorImage src={src} alt={alt} className={className} sizes={sizes} priority={priority} />

      <div className="pointer-events-none absolute inset-0 bg-[#181715]/0 transition group-hover:bg-[#181715]/20" />

      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <label
          htmlFor={inputId}
          className="pointer-events-auto cursor-pointer border border-[#f6f3ee] bg-[#181715] px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-[#f6f3ee]"
        >
          {isUploading ? "Uploading" : "Replace image"}
        </label>
        {onAltChange ? (
          <input
            type="text"
            value={alt}
            placeholder="Alt text"
            onChange={(event) => onAltChange(event.target.value)}
            className="pointer-events-auto min-w-[120px] flex-1 border border-[#f6f3ee] bg-[#fbf8f2]/95 px-2 py-1.5 text-xs text-[#181715] outline-none"
            aria-label={`${label} alt text`}
          />
        ) : null}
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {error ? <p className="absolute left-3 right-3 top-3 bg-[#fbf8f2] px-2 py-1 text-xs text-[#8b3a2f]">{error}</p> : null}
    </div>
  );
}
