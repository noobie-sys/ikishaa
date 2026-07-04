"use client";

import { EditableTextField } from "@/modules/templates-editor/components/EditableTextField";

export type TemplateTextProps = {
  value: string;
  label: string;
  className?: string;
  multiline?: boolean;
  maxLength?: number;
  as?: "p" | "span" | "h1";
  onChange?: (value: string) => void;
};

export function TemplateText({
  value,
  label,
  className = "",
  multiline = false,
  maxLength = 4000,
  as: Tag = "p",
  onChange
}: TemplateTextProps) {
  if (onChange) {
    return (
      <EditableTextField
        value={value}
        onChange={onChange}
        className={className}
        label={label}
        multiline={multiline}
        maxLength={maxLength}
      />
    );
  }

  return <Tag className={className}>{value}</Tag>;
}
