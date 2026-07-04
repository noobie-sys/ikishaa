import Link from "next/link";

const sampleSections = [
  { label: "Text", detail: "Structured copy only" },
  { label: "Gallery", detail: "Responsive image groups" },
  { label: "Carousel", detail: "Touch friendly showcases" }
];

const principles = [
  "Content stays pure JSON",
  "Templates own layout and theme",
  "Animations stay reusable",
  "Public pages render fast"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-6 text-[#181715] sm:px-8 lg:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#d8d0c4] pb-5">
        <Link href="/" className="font-serif text-2xl">
          Ikisha
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/demo" className="text-[#625d55] transition hover:text-[#181715]">
            Demo
          </Link>
          <Link href="/templates" className="text-[#625d55] transition hover:text-[#181715]">
            Templates
          </Link>
          <a
            href={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"}/api/auth/google`}
            className="border border-[#181715] px-4 py-2 transition hover:bg-[#181715] hover:text-[#f6f3ee]"
          >
            Sign in
          </a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(280px,460px)_1fr] lg:py-20">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.24em] text-[#8e877c]">Portfolio publishing</p>
            <h1 className="font-serif text-6xl leading-none sm:text-7xl lg:text-8xl">Template driven portfolios.</h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[#625d55] sm:text-xl sm:leading-9">
            Upload images and text, choose a premium template, and publish a fast public page without exposing
            styling controls to users.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="border border-[#181715] bg-[#181715] px-5 py-3 text-sm text-[#f6f3ee] transition hover:bg-transparent hover:text-[#181715]"
            >
              View local demo
            </Link>
            <Link
              href="/templates"
              className="border border-[#181715] px-5 py-3 text-sm transition hover:bg-[#181715] hover:text-[#f6f3ee]"
            >
              Browse templates
            </Link>
            <Link
              href="/demo/mono-collage"
              className="border border-[#181715] px-5 py-3 text-sm transition hover:bg-[#181715] hover:text-[#f6f3ee]"
            >
              Mono collage demo
            </Link>
            <Link
              href="/demo/editorial-strip"
              className="border border-[#181715] px-5 py-3 text-sm transition hover:bg-[#181715] hover:text-[#f6f3ee]"
            >
              Editorial strip demo
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#20201d] sm:translate-y-10">
            <div className="absolute inset-x-5 top-5 h-24 border border-[#cfc6b8]" />
            <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-3">
              <div className="aspect-square bg-[#c4b79f]" />
              <div className="aspect-square bg-[#e1d8ca]" />
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#d8d0c4]">
            <div className="absolute left-5 right-5 top-5 space-y-3">
              <div className="h-3 w-2/3 bg-[#181715]" />
              <div className="h-3 w-1/2 bg-[#625d55]" />
            </div>
            <div className="absolute inset-x-5 bottom-5 aspect-[4/3] bg-[#8f9d8a]" />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ede7dd] sm:translate-y-16">
            <div className="absolute inset-x-5 top-5 aspect-[16/10] bg-[#b96f5a]" />
            <div className="absolute bottom-5 left-5 right-5 flex gap-2">
              <div className="h-2 flex-1 bg-[#181715]" />
              <div className="h-2 flex-1 bg-[#c4b79f]" />
              <div className="h-2 flex-1 bg-[#c4b79f]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 border-t border-[#d8d0c4] py-10 lg:grid-cols-3">
        {sampleSections.map((section) => (
          <div key={section.label} className="border border-[#d8d0c4] p-5">
            <h2 className="mb-2 font-serif text-3xl">{section.label}</h2>
            <p className="text-[#625d55]">{section.detail}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 border-t border-[#d8d0c4] py-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="font-serif text-4xl leading-tight sm:text-5xl">No drag and drop. No arbitrary styling.</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {principles.map((principle) => (
            <div key={principle} className="flex items-center justify-between border-b border-[#d8d0c4] py-4">
              <span>{principle}</span>
              <span className="text-[#8e877c]">01</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
