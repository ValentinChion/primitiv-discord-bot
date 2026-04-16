"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              PRIMITIV
            </Link>
            <div className="flex gap-6">
              <Link
                href="/primitiv/demande"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Demandes
              </Link>
              <Link
                href="/primitiv/schedule-handler"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Schedule
              </Link>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
