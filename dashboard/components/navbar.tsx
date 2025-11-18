import Link from "next/link";

export function Navbar() {
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
                href="/demandes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Demandes
              </Link>
              <Link
                href="/paiements"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Paiements
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
