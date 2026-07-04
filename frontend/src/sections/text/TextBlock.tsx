"use client";

import { motion } from "framer-motion";
import { TemplateText } from "@/components/template-fields/TemplateText";
import type { Section } from "@/types/page";
import { revealMotion } from "@/animations/core/reveal";

export function TextBlock({
  section,
  className = "",
  editing
}: {
  section: Extract<Section, { type: "text" }>;
  className?: string;
  editing?: {
    label: string;
    onChange: (text: string) => void;
  };
}) {
  if (editing) {
    return (
      <section className={className}>
        <TemplateText
          value={section.content}
          onChange={editing.onChange}
          label={editing.label}
          className=""
          multiline
        />
      </section>
    );
  }

  return (
    <motion.section {...revealMotion} className={className}>
      <p>{section.content}</p>
    </motion.section>
  );
}
