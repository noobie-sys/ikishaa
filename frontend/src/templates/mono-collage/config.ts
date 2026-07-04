export const monoCollageConfig = {
  id: "mono-collage",
  name: "Mono Collage",
  theme: {
    background: "bg-white",
    foreground: "text-black",
    gutter: "gap-[3px]",
    imageFilter: "grayscale contrast-[1.08]"
  },
  layout: {
    shell: "min-h-screen px-3 py-5 sm:px-5 sm:py-7",
    grid: "mx-auto grid max-w-5xl grid-cols-12 auto-rows-[minmax(88px,1fr)]",
    label: "text-[10px] uppercase tracking-[0.34em] text-black/70 sm:text-[11px]",
    caption: "text-xs leading-6 text-black/55 sm:text-sm sm:leading-7"
  }
} as const;
