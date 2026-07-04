export const minimalGridConfig = {
  id: "minimal-grid",
  name: "Minimal Grid",
  theme: {
    background: "bg-[#f6f3ee]",
    foreground: "text-[#181715]",
    muted: "text-[#726f68]",
    border: "border-[#d8d0c4]"
  },
  layout: {
    shell: "min-h-screen px-5 py-8 sm:px-8 lg:px-12",
    main: "mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[minmax(240px,360px)_1fr]",
    aside: "lg:sticky lg:top-8 lg:h-fit",
    content: "space-y-10"
  },
  typography: {
    title: "font-serif text-5xl leading-none sm:text-7xl",
    text: "text-lg leading-8 sm:text-xl sm:leading-9"
  }
} as const;
