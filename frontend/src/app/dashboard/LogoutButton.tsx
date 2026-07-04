"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } finally {
      window.localStorage.removeItem("ikisha_access_token");
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="border border-[#181715] px-4 py-2 text-sm transition hover:bg-[#181715] hover:text-[#f6f3ee] disabled:cursor-wait disabled:opacity-60"
    >
      {isLoggingOut ? "Signing out" : "Logout"}
    </button>
  );
}
