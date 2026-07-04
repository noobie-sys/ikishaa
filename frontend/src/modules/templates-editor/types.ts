import type { ComponentType } from "react";
import type { EditorialStripContent } from "@/types/editorialStrip";
import type { MonoCollageContent } from "@/types/monoCollage";
import type { MinimalGridPageContent, TemplateID } from "@/types/page";

export type MinimalGridChrome = {
  asideLabel: string;
};

export type TemplateChrome = {
  "minimal-grid": MinimalGridChrome;
  "mono-collage": Record<string, never>;
  "editorial-strip": Record<string, never>;
};

export type TemplateContentMap = {
  "minimal-grid": MinimalGridPageContent;
  "mono-collage": MonoCollageContent;
  "editorial-strip": EditorialStripContent;
};

export type TemplateEditorDefinition<T extends TemplateID = TemplateID> = {
  id: T;
  name: string;
  status: "Available" | "Coming soon";
  description: string;
  defaultContent: TemplateContentMap[T];
  defaultChrome: TemplateChrome[T];
  EditorView: ComponentType<TemplateEditorViewProps<T>>;
};

export type TemplateEditorViewProps<T extends TemplateID = TemplateID> = {
  content: TemplateContentMap[T];
  chrome: TemplateChrome[T];
  onContentChange: (content: TemplateContentMap[T]) => void;
  onChromeChange: (chrome: TemplateChrome[T]) => void;
};
