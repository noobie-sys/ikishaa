import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageRenderer } from "@/modules/page-renderer/PageRenderer";
import type { PublicPage } from "@/types/page";
import { pageDescription } from "@/lib/pageContent";
import { validatePageContent } from "@/types/validation";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

async function getPage(slug: string): Promise<PublicPage | null> {
  const baseURL = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${baseURL}/api/pages/${slug}`, {
    next: { revalidate }
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Failed to load page");
  }
  const page = (await res.json()) as PublicPage;
  if (!validatePageContent(page.content, page.template)) {
    throw new Error("Invalid page content contract");
  }
  return page;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug);
  if (!page) {
    return {};
  }
  const description = pageDescription(page.content);
  return {
    title: `${page.slug} | Ikisha`,
    description,
    openGraph: {
      title: `${page.slug} | Ikisha`,
      description,
      type: "profile"
    }
  };
}

export default async function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) {
    notFound();
  }
  return <PageRenderer page={page} />;
}
