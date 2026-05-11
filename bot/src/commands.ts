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
    {
      type: ApplicationCommandOptionType.Attachment,
      name: "facture",
      description: "Devis ou facture (optionnel)",
      required: false,
    },
  ],
};

export const HELP_COMMAND = {
  name: "help",
  description: "Afficher la liste des commandes disponibles",
};

export const ALL_COMMANDS = [DEMANDE_COMMAND, HELP_COMMAND];
