import type { PublicPage } from "@/types/page";
import { TemplateRenderer } from "./TemplateRenderer";

export function PageRenderer({ page }: { page: PublicPage }) {
  return <TemplateRenderer template={page.template} content={page.content} />;
}
