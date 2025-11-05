-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('PENDING', 'DENIED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('DEMANDE', 'PAIEMENT', 'REMBOURSEMENT');

-- CreateTable
CREATE TABLE "Demande" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "statut" "Statut" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "factureUrl" TEXT,
    "paiementId" INTEGER,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" SERIAL NOT NULL,
    "demandeId" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "factureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Demande_name_key" ON "Demande"("name");

-- CreateIndex
CREATE INDEX "Demande_name_idx" ON "Demande"("name");

-- CreateIndex
CREATE INDEX "Demande_userId_idx" ON "Demande"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_demandeId_key" ON "Paiement"("demandeId");

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_paiementId_fkey" FOREIGN KEY ("paiementId") REFERENCES "Paiement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
