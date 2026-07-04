import Link from "next/link";
import type { Metadata } from "next";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "Dashboard | Ikisha",
  description: "Manage your Ikisha portfolio."
};

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-6 text-[#181715] sm:px-8 lg:px-12">
      <nav className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#d8d0c4] pb-5">
        <Link href="/" className="font-serif text-2xl">
          Ikisha
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/templates" className="text-[#625d55] transition hover:text-[#181715]">
            Templates
          </Link>
          <LogoutButton />
        </div>
      </nav>

      <section className="mx-auto max-w-7xl py-12">
        <p className="mb-5 text-xs uppercase tracking-[0.24em] text-[#8e877c]">Dashboard</p>
        <h1 className="font-serif text-5xl leading-none sm:text-6xl">Your portfolio workspace.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#625d55]">
          You are signed in. Use the logout button in the navigation to end this session.
        </p>
      </section>
    </main>
  );
}
