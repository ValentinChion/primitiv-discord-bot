export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 text-center px-4">
        <h1 className="text-4xl font-bold tracking-tight">
          PRIMITIV: Suivis Financier
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Dashboard de suivi des demandes et paiements financiers
        </p>
        <div className="flex flex-col gap-4 mt-8 text-sm text-muted-foreground">
          <p>
            Le projet est configuré avec Next.js, TypeScript, Tailwind CSS, Shadcn UI et Prisma.
          </p>
          <p>
            Vous pouvez maintenant ajouter les composants Shadcn et créer les pages pour:
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Suivre et mettre à jour les demandes</li>
            <li>Suivre les paiements</li>
            <li>Navigation entre les pages</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
