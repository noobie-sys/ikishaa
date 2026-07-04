import type { PageContent, PublicPage } from "@/types/page";

export const demoPageContent: PageContent = {
  version: 1,
  sections: [
    {
      type: "text",
      content: "Selected Work"
    },
    {
      type: "text",
      content: "Independent art director shaping calm digital identities, editorial systems, and image-led portfolios."
    },
    {
      type: "gallery",
      layout: "grid",
      images: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
          alt: "Studio work sample"
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg",
          alt: "Editorial image sample"
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg",
          alt: "Brand system sample"
        }
      ]
    },
    {
      type: "text",
      content:
        "The content is simple JSON. The template controls the design, spacing, typography, and animation behavior."
    },
    {
      type: "carousel",
      items: [
        {
          url: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg"
        },
        {
          url: "https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg"
        }
      ]
    }
  ]
};

export const demoPublicPage: PublicPage = {
  id: "demo-page",
  user_id: "demo-user",
  slug: "demo",
  template: "minimal-grid",
  content: demoPageContent,
  is_published: true,
  created_at: "2026-05-08T00:00:00Z",
  updated_at: "2026-05-08T00:00:00Z"
};
