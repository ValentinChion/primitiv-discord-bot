import { PrismaClient, Statut, Type } from '../prisma/client';

export const prisma = new PrismaClient();

export class DemandeService {
  static async createDemande(name: string, userId: string, montant: number, description: string) {
    return prisma.demande.create({
      data: {
        name,
        userId,
        montant,
        description,
        type: Type.DEMANDE,
        statut: Statut.PENDING,
      },
    });
  }

  static async validateDemande(id: number, statut: Statut) {
    return prisma.demande.update({
      where: { id },
      data: { statut },
    });
  }

  static async createPaiement(demandeId: number, montant: number, factureUrl: string) {
    return prisma.paiement.create({
      data: {
        demandeId,
        montant,
        factureUrl,
      },
    });
  }

  static async createRemboursement(userId: string, demandeId: number, montant: number, factureUrl: string) {
    return prisma.demande.create({
      data: {
        name: `remboursement_${demandeId}`,
        userId,
        montant,
        description: `Remboursement pour la demande #${demandeId}`,
        type: Type.REMBOURSEMENT,
        statut: Statut.PENDING,
        paiementId: demandeId,
        factureUrl,
      },
    });
  }

  static async checkDemandeExists(name: string): Promise<boolean> {
    const existingDemande = await prisma.demande.findUnique({
      where: { name },
    });
    return !!existingDemande; // Retourne true si la demande existe
  }
}
