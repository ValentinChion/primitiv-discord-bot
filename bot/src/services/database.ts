/**
 * Database service for managing financial requests
 * Uses Prisma with Accelerate for connection pooling on Cloudflare Workers
 */

import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Singleton pattern for Prisma client
let prisma: ReturnType<typeof createPrismaClient> | null = null;

function createPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate());
}

export function getPrismaClient(databaseUrl: string) {
  if (!prisma) {
    prisma = createPrismaClient(databaseUrl);
  }
  return prisma;
}

export class DemandeService {
  static async createDemande(
    prisma: ReturnType<typeof createPrismaClient>,
    name: string,
    userId: string,
    montant: number,
    description: string
  ) {
    return await prisma.demande.create({
      data: {
        name,
        userId,
        montant,
        description,
        type: 'DEMANDE',
        statut: 'PENDING',
      },
    });
  }

  static async validateDemande(
    prisma: ReturnType<typeof createPrismaClient>,
    id: number,
    statut: 'PENDING' | 'DENIED' | 'VALIDATED'
  ) {
    return await prisma.demande.update({
      where: { id },
      data: { statut },
    });
  }

  static async createPaiement(
    prisma: ReturnType<typeof createPrismaClient>,
    demandeId: number,
    montant: number,
    factureUrl: string
  ) {
    const paiement = await prisma.paiement.create({
      data: {
        demandeId,
        montant,
        factureUrl,
      },
    });

    await prisma.demande.update({
      where: { id: demandeId },
      data: {
        type: 'PAIEMENT',
        statut: 'VALIDATED',
        paiementId: paiement.id,
        factureUrl,
      },
    });

    return paiement;
  }

  static async createRemboursement(
    prisma: ReturnType<typeof createPrismaClient>,
    userId: string,
    demandeId: number,
    montant: number,
    factureUrl: string
  ) {
    const originalDemande = await prisma.demande.findUnique({
      where: { id: demandeId },
    });

    if (!originalDemande) {
      throw new Error('Demande originale non trouvée');
    }

    return await prisma.demande.create({
      data: {
        name: `remboursement_${originalDemande.name}`,
        userId,
        montant,
        description: `Remboursement pour: ${originalDemande.description}`,
        type: 'REMBOURSEMENT',
        statut: 'PENDING',
        factureUrl,
      },
    });
  }

  static async checkDemandeExists(
    prisma: ReturnType<typeof createPrismaClient>,
    name: string
  ) {
    const demande = await prisma.demande.findUnique({
      where: { name },
    });
    return demande !== null;
  }

  static async getDemandeByName(
    prisma: ReturnType<typeof createPrismaClient>,
    name: string
  ) {
    return await prisma.demande.findUnique({
      where: { name },
    });
  }
}
