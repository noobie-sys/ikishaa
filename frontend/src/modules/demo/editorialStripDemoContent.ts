import type { EditorialStripContent } from "@/types/editorialStrip";
import type { PublicPage } from "@/types/page";

const demoImage = (path: string, alt: string) => ({
  url: `https://res.cloudinary.com/demo/image/upload/${path}`,
  alt
});

export const editorialStripDemoContent: EditorialStripContent = {
  version: 1,
  kind: "editorial-strip",
  header: {
    left: "(00)",
    brand: "THEMANAGEGRAM",
    right: "(2024)"
  },
  slides: [
    {
      image: demoImage("cld-sample.jpg", "Coastal towel study"),
      line1: "INSPO—",
      line2: "CHRONIQUES DE L'ÉTÉ [024]"
    },
    {
      image: demoImage("sample.jpg", "Misty shoreline"),
      line1: "INSPO—",
      line2: "SLOW TIDES [025]"
    },
    {
      image: demoImage("cld-sample-2.jpg", "Swimmer from above"),
      line1: "INSPO—",
      line2: "EAU NOIRE [026]"
    },
    {
      image: demoImage("cld-sample-3.jpg", "Golden hour horizon"),
      line1: "INSPO—",
      line2: "LAST LIGHT [027]"
    },
    {
      image: demoImage("cld-sample.jpg", "Pearl and skin detail"),
      line1: "INSPO—",
      line2: "TEXTURES [028]"
    }
  ]
};

export const editorialStripDemoPublicPage: PublicPage = {
  id: "demo-editorial-strip",
  user_id: "demo-user",
  slug: "demo-editorial-strip",
  template: "editorial-strip",
  content: editorialStripDemoContent,
  is_published: true,
  created_at: "2026-05-16T00:00:00Z",
  updated_at: "2026-05-16T00:00:00Z"
};
