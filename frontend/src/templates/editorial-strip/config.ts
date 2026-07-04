export const editorialStripConfig = {
  id: "editorial-strip",
  name: "Editorial Strip",
  theme: {
    background: "bg-[#f2f0eb]",
    foreground: "text-black"
  },
  layout: {
    shell: "flex min-h-screen flex-col",
    header: "flex items-center justify-between px-6 py-7 sm:px-10 sm:py-9",
    headerSide: "text-[11px] font-normal uppercase tracking-[0.12em] text-black",
    headerBrand: "text-[13px] font-bold uppercase tracking-[0.22em] text-black sm:text-sm",
    carousel: "flex-1 overflow-hidden py-2 sm:py-4",
    slide: "min-w-0 flex-[0_0_78%] pl-3 sm:flex-[0_0_52%] sm:pl-4 md:flex-[0_0_44%]",
    image: "relative aspect-[3/4] w-full overflow-hidden bg-[#e8e4dc]",
    caption: "mt-4 space-y-1 pr-3 sm:pr-4",
    line1: "text-[11px] font-bold uppercase tracking-[0.08em] text-black",
    line2: "text-[11px] font-bold uppercase tracking-[0.28em] text-black sm:tracking-[0.34em]"
  },
  motion: {
    autoplayDelayMs: 4200,
    transitionDurationMs: 900
  }
} as const;
