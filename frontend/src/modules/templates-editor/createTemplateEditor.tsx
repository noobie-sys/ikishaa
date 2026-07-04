"use client";

import type { ComponentType } from "react";
import type { TemplateChrome, TemplateContentMap, TemplateEditorViewProps } from "@/modules/templates-editor/types";
import type { TemplateID } from "@/types/page";

type TemplateWithEditingProps<T extends TemplateID> = {
  content: TemplateContentMap[T];
  chrome?: TemplateChrome[T];
  onContentChange?: (content: TemplateContentMap[T]) => void;
  onChromeChange?: (chrome: TemplateChrome[T]) => void;
  onLocalPreview?: () => void;
};

export function createTemplateEditor<T extends TemplateID>(
  Template: ComponentType<TemplateWithEditingProps<T>>
): ComponentType<TemplateEditorViewProps<T>> {
  function TemplateEditor(props: TemplateEditorViewProps<T>) {
    return (
      <Template
        content={props.content}
        chrome={props.chrome}
        onContentChange={props.onContentChange}
        onChromeChange={props.onChromeChange}
      />
    );
  }

  return TemplateEditor;
}
