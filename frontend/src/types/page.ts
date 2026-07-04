import type { EditorialStripContent } from "@/types/editorialStrip";
import type { MonoCollageContent } from "@/types/monoCollage";

export type MinimalGridPageContent = {
  version: 1;
  sections: Section[];
};

export type PageContent = MinimalGridPageContent | MonoCollageContent | EditorialStripContent;

export type Section =
  | {
      type: "gallery";
      layout: "grid" | "stack";
      images: {
        url: string;
        alt?: string;
      }[];
    }
  | {
      type: "text";
      content: string;
    }
  | {
      type: "carousel";
      items: {
        url: string;
      }[];
    };

export type TemplateID = "minimal-grid" | "mono-collage" | "editorial-strip";

export type PublicPage = {
  id: string;
  user_id: string;
  slug: string;
  template: TemplateID;
  content: PageContent;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
