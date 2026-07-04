"use client";

import { useState } from "react";
import { TemplateImage } from "@/components/template-fields/TemplateImage";
import { TemplateText } from "@/components/template-fields/TemplateText";
import {
  monoCollageImageKeys,
  monoCollageImageLabels,
  type MonoCollageContent,
  type MonoCollageImageKey
} from "@/types/monoCollage";
import { monoCollageConfig as cfg } from "./config";
import { MonoLogo } from "./MonoLogo";

type MonoCollageTemplateProps = {
  content: MonoCollageContent;
  onContentChange?: (content: MonoCollageContent) => void;
  onLocalPreview?: () => void;
};

const imageLayout: Record<
  MonoCollageImageKey,
  { className: string; sizes: string; priority?: boolean }
> = {
  topLeft: {
    className: `col-span-5 row-span-2 sm:col-span-5`,
    sizes: "(min-width: 640px) 24vw, 42vw"
  },
  tallRight: {
    className: "col-span-7 row-span-3 sm:col-span-7",
    sizes: "(min-width: 640px) 34vw, 58vw",
    priority: true
  },
  main: {
    className: "col-span-5 row-span-4 sm:col-span-5",
    sizes: "(min-width: 640px) 24vw, 42vw",
    priority: true
  },
  midRight: {
    className: "col-span-7 row-span-2 sm:col-span-7",
    sizes: "(min-width: 640px) 34vw, 58vw"
  },
  bottomRight: {
    className: "col-span-4 row-span-2 sm:col-span-4",
    sizes: "(min-width: 640px) 18vw, 32vw"
  }
};

export function MonoCollageTemplate({ content, onContentChange, onLocalPreview }: MonoCollageTemplateProps) {
  const [localPreviewNotice, setLocalPreviewNotice] = useState(false);
  const editing = Boolean(onContentChange);

  function patchImage(key: MonoCollageImageKey, url: string) {
    onContentChange?.({
      ...content,
      images: {
        ...content.images,
        [key]: { ...content.images[key], url }
      }
    });
  }

  function patch(patch: Partial<MonoCollageContent>) {
    onContentChange?.({ ...content, ...patch });
  }

  function handleLocalPreview() {
    setLocalPreviewNotice(true);
    onLocalPreview?.();
  }

  return (
    <main className={`${cfg.theme.background} ${cfg.theme.foreground} ${cfg.layout.shell}`}>
      {editing && localPreviewNotice ? (
        <p className="mx-auto mb-6 max-w-5xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm text-black/60">
          Image saved locally for preview. Sign in to upload to your media library for published pages.
        </p>
      ) : null}

      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-start justify-between sm:mb-7">
          <MonoLogo />
          <TemplateText
            value={content.label}
            label="collection label"
            className={`max-w-[12rem] text-right ${cfg.layout.label}`}
            maxLength={120}
            onChange={editing ? (label) => patch({ label }) : undefined}
          />
        </header>

        <div className={`${cfg.layout.grid} ${cfg.theme.gutter} min-h-[min(78vh,720px)]`}>
          {monoCollageImageKeys.map((key) => {
            const layout = imageLayout[key];
            const image = content.images[key];
            return (
              <div
                key={key}
                className={`relative overflow-hidden bg-neutral-100 ${layout.className} ${key === "main" ? "bg-neutral-200" : ""}`}
              >
                <TemplateImage
                  src={image.url}
                  alt={image.alt ?? ""}
                  label={monoCollageImageLabels[key]}
                  sizes={layout.sizes}
                  priority={layout.priority}
                  className={`object-cover ${cfg.theme.imageFilter}`}
                  onUrlChange={editing ? (url) => patchImage(key, url) : undefined}
                  onLocalPreview={editing ? handleLocalPreview : undefined}
                />
              </div>
            );
          })}
        </div>

        <footer className="mt-5 border-t border-black/10 pt-4 sm:mt-7">
          <TemplateText
            value={content.caption}
            label="footer caption"
            className={cfg.layout.caption}
            multiline
            maxLength={400}
            onChange={editing ? (caption) => patch({ caption }) : undefined}
          />
        </footer>
      </div>
    </main>
  );
}
