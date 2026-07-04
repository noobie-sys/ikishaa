import { demoPageContent } from "@/modules/demo/demoContent";
import { editorialStripDemoContent } from "@/modules/demo/editorialStripDemoContent";
import { monoCollageDemoContent } from "@/modules/demo/monoCollageDemoContent";
import { createTemplateEditor } from "@/modules/templates-editor/createTemplateEditor";
import type { TemplateEditorDefinition } from "@/modules/templates-editor/types";
import type { TemplateID } from "@/types/page";
import { MinimalGridTemplate } from "@/templates/minimal-grid";
import { EditorialStripTemplate } from "@/templates/editorial-strip";
import { MonoCollageTemplate } from "@/templates/mono-collage";

const templateDefinitions = [
  {
    id: "minimal-grid",
    name: "Minimal Grid",
    status: "Available",
    description:
      "A quiet editorial template for image-led portfolios. Every gallery image, carousel slide, and text block is individually editable.",
    defaultContent: demoPageContent,
    defaultChrome: {
      asideLabel: "Portfolio"
    },
    EditorView: createTemplateEditor<"minimal-grid">(MinimalGridTemplate)
  },
  {
    id: "mono-collage",
    name: "Mono Collage",
    status: "Available",
    description:
      "A high-contrast monochrome collage. All five images, the label, and the caption can be replaced independently.",
    defaultContent: monoCollageDemoContent,
    defaultChrome: {},
    EditorView: createTemplateEditor<"mono-collage">(MonoCollageTemplate)
  },
  {
    id: "editorial-strip",
    name: "Editorial Strip",
    status: "Available",
    description:
      "A cream-toned horizontal carousel with smooth autoplay, peek slides, and bold captions beneath each image.",
    defaultContent: editorialStripDemoContent,
    defaultChrome: {},
    EditorView: createTemplateEditor<"editorial-strip">(EditorialStripTemplate)
  }
] as const;

export const templateRegistry = templateDefinitions as unknown as TemplateEditorDefinition[];

export function getTemplateDefinition(templateId: TemplateID): TemplateEditorDefinition {
  const definition = templateRegistry.find((template) => template.id === templateId);
  if (!definition) {
    throw new Error(`Unknown template: ${templateId}`);
  }
  return definition;
}
