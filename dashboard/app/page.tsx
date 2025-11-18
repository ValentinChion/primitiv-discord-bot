import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center gap-8 text-center max-w-3xl mx-auto mt-16">
        <h1 className="text-4xl font-bold tracking-tight">
          PRIMITIV: Suivis Financier
        </h1>
        <p className="text-muted-foreground text-lg">
          Dashboard de suivi des demandes et paiements financiers
        </p>

        <div className="grid md:grid-cols-2 gap-6 w-full mt-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Demandes</CardTitle>
              <CardDescription>
                Suivre et gérer toutes les demandes financières avec mise à jour des statuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/demandes">
                <Button className="w-full">
                  Voir les demandes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Paiements</CardTitle>
              <CardDescription>
                Consulter l'historique de tous les paiements effectués
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/paiements">
                <Button className="w-full">
                  Voir les paiements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Technologies utilisées:</p>
          <p>Next.js 16 • TypeScript • Tailwind CSS • Shadcn UI • Prisma • PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
