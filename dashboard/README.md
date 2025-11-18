# PRIMITIV: Suivis Financier

Dashboard Next.js pour suivre les demandes et paiements financiers.

## Installation

1. Installer les dépendances:
```bash
pnpm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```
Puis modifier `.env` avec vos informations de base de données.

3. Générer le client Prisma:
```bash
pnpm prisma:generate
```

4. Appliquer les migrations (si nécessaire):
```bash
pnpm prisma:migrate
```

## Développement

Lancer le serveur de développement:
```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts disponibles

- `pnpm dev` - Lance le serveur de développement
- `pnpm build` - Compile l'application pour la production
- `pnpm start` - Lance le serveur de production
- `pnpm lint` - Vérifie le code avec ESLint
- `pnpm prisma:generate` - Génère le client Prisma
- `pnpm prisma:migrate` - Applique les migrations de base de données
- `pnpm prisma:studio` - Ouvre Prisma Studio pour gérer la base de données

## Technologies

- **Next.js 16** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Styles
- **Shadcn UI** - Composants UI (thème Zinc)
- **Prisma** - ORM pour PostgreSQL

## Structure du projet

- `/app` - Pages et routes Next.js (App Router)
- `/components` - Composants React réutilisables
- `/components/ui` - Composants UI de Shadcn
- `/lib` - Utilitaires et configurations (Prisma client, etc.)
- `/prisma` - Schéma et migrations Prisma

## Base de données

Le schéma Prisma définit deux modèles principaux:

- **Demande** - Demandes financières avec statut (PENDING, VALIDATED, DENIED)
- **Paiement** - Paiements associés aux demandes

## Ajouter des composants Shadcn

Pour ajouter des composants Shadcn UI:
```bash
pnpm dlx shadcn@latest add [component-name]
```

Exemple:
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add card
```
