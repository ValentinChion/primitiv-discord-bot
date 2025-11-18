import { ApplicationCommandOptionType } from "discord.js";

/**
 * Command definitions for the Discord bot
 * These will be registered with Discord to create slash commands
 */

export const DEMANDE_COMMAND = {
  name: "demande",
  description: "Créer une nouvelle demande de dépense",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "nom",
      description: "Nom unique de la demande (ex: achat_stylos)",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "montant",
      description: "Montant de la demande en euros",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "description",
      description: "Description de la demande",
      required: true,
    },
  ],
};

export const CONFIRME_COMMAND = {
  name: "confirme",
  description: "Confirmer un paiement avec la carte de l'association",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "nom",
      description: "Nom de la demande à confirmer",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "montant",
      description: "Montant du paiement",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "facture",
      description: "Fichier PDF de la facture",
      required: true,
    },
  ],
};

export const REMBOURSEMENT_COMMAND = {
  name: "remboursement",
  description:
    "Demander le remboursement d'un paiement effectué avec votre carte personnelle",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "nom",
      description: "Nom de la demande validée",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Number,
      name: "montant",
      description: "Montant à rembourser",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "facture",
      description: "Fichier PDF de la facture",
      required: true,
    },
  ],
};

export const ALL_COMMANDS = [
  DEMANDE_COMMAND,
  CONFIRME_COMMAND,
  REMBOURSEMENT_COMMAND,
];
