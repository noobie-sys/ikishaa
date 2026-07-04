import type { Metadata } from "next";
import { PageRenderer } from "@/modules/page-renderer/PageRenderer";
import { demoPublicPage } from "@/modules/demo/demoContent";

export const metadata: Metadata = {
  title: "Development Demo | Ikisha",
  description: "Local development preview of the Minimal Grid portfolio template."
};

export default function DemoPage() {
  return <PageRenderer page={demoPublicPage} />;
}
