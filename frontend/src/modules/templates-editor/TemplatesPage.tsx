"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { countEditableFields } from "@/modules/templates-editor/editing";
import { usePageContentEditor } from "@/modules/templates-editor/hooks/usePageContentEditor";
import { templateRegistry } from "@/modules/templates-editor/registry";
import type { TemplateID } from "@/types/page";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function TemplatesPage() {
  const {
    activeTemplateId,
    definition,
    content,
    chrome,
    selectTemplate,
    resetTemplate,
    setContent,
    updateChrome
  } = usePageContentEditor("minimal-grid");

  const [showJson, setShowJson] = useState(false);
  const EditorView = definition.EditorView;

  const editableCounts = useMemo(
    () => countEditableFields(activeTemplateId, content),
    [activeTemplateId, content]
  );

  const exportPayload = useMemo(
    () => ({
      template: activeTemplateId,
      content,
      chrome
    }),
    [activeTemplateId, chrome, content]
  );

  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-6 text-[#181715] sm:px-8 lg:px-12">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-[#d8d0c4] pb-5">
        <Link href="/" className="font-serif text-2xl">
          Ikisha
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/demo" className="text-[#625d55] transition hover:text-[#181715]">
            Demo
          </Link>
          <Link href="/templates" className="text-[#181715]">
            Templates
          </Link>
          <a
            href={`${apiBaseUrl}/api/auth/google`}
            className="border border-[#181715] px-4 py-2 transition hover:bg-[#181715] hover:text-[#f6f3ee]"
          >
            Sign in
          </a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 py-10 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[#8e877c]">Template library</p>
            <h1 className="font-serif text-4xl leading-none sm:text-5xl">Edit templates.</h1>
            <p className="mt-4 text-sm leading-7 text-[#625d55]">
              Change copy and images only. Layout, spacing, typography, and motion stay locked by the platform
              template.
            </p>
          </div>

          <ul className="space-y-3">
            {templateRegistry.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  onClick={() => selectTemplate(template.id as TemplateID)}
                  className={`w-full border px-4 py-3 text-left transition ${
                    template.id === activeTemplateId
                      ? "border-[#181715] bg-[#181715] text-[#f6f3ee]"
                      : "border-[#d8d0c4] bg-[#fbf8f2] hover:border-[#181715]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] opacity-80">{template.status}</p>
                  <p className="mt-1 font-serif text-2xl">{template.name}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetTemplate}
              className="border border-[#181715] px-3 py-2 text-xs uppercase tracking-[0.14em] transition hover:bg-[#181715] hover:text-[#f6f3ee]"
            >
              Reset changes
            </button>
            <button
              type="button"
              onClick={() => setShowJson((current) => !current)}
              className="border border-[#d8d0c4] px-3 py-2 text-xs uppercase tracking-[0.14em] transition hover:border-[#181715]"
            >
              {showJson ? "Hide JSON" : "View JSON"}
            </button>
          </div>

          {showJson ? (
            <pre className="max-h-64 overflow-auto border border-[#d8d0c4] bg-[#fbf8f2] p-3 text-xs leading-5 text-[#625d55]">
              {JSON.stringify(exportPayload, null, 2)}
            </pre>
          ) : null}
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#d8d0c4] bg-[#fbf8f2] px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8e877c]">Editor</p>
              <p className="font-serif text-2xl">{definition.name}</p>
            </div>
            <p className="text-sm text-[#625d55]">
              Click any text to edit · hover any of {editableCounts.images} images to replace one by one
            </p>
          </div>

          <div className="overflow-hidden border border-[#d8d0c4] bg-[#f6f3ee]">
            <EditorView
              content={content as never}
              chrome={chrome as never}
              onContentChange={setContent as never}
              onChromeChange={updateChrome as never}
            />
          </div>

          <p className="mt-4 text-sm leading-7 text-[#625d55]">{definition.description}</p>
        </div>
      </section>
    </main>
  );
}
