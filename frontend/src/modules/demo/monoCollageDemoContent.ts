import type { MonoCollageContent } from "@/types/monoCollage";
import type { PublicPage } from "@/types/page";

export const monoCollageDemoContent: MonoCollageContent = {
  version: 1,
  kind: "mono-collage",
  images: {
    topLeft: {
      url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg",
      alt: "Texture study"
    },
    tallRight: {
      url: "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg",
      alt: "Vertical frame"
    },
    main: {
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      alt: "Foggy road portrait"
    },
    midRight: {
      url: "https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg",
      alt: "Branches against sky"
    },
    bottomRight: {
      url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg",
      alt: "Architectural detail"
    }
  },
  label: "Collection No. 1",
  caption: "A study in contrast, negative space, and quiet monochrome frames."
};

export const monoCollageDemoPublicPage: PublicPage = {
  id: "demo-mono-collage",
  user_id: "demo-user",
  slug: "demo-mono-collage",
  template: "mono-collage",
  content: monoCollageDemoContent,
  is_published: true,
  created_at: "2026-05-16T00:00:00Z",
  updated_at: "2026-05-16T00:00:00Z"
};
