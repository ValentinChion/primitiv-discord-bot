/**
 * Handler for button interactions (Accept/Deny requests)
 */

import {
  InteractionResponseType,
  InteractionResponseFlags,
} from "discord-interactions";
import { DemandeService } from "../services/database.js";
import type { Env } from "../types.js";

export async function handleButtonInteraction(
  interaction: any,
  env: Env
): Promise<Response> {
  const customId = interaction.data.custom_id;
  const userId = interaction.member?.user?.id || interaction.user?.id;

  // Only treasurer can use buttons
  if (userId !== env.TRESORIER_ID) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "❌ Seul le trésorier peut accepter ou refuser des demandes",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  if (customId.startsWith("accept_")) {
    return handleAcceptButton(interaction, env, customId);
  } else if (customId.startsWith("deny_")) {
    return handleDenyButton(interaction, env, customId);
  }

  return new Response(
    JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "❌ Action non reconnue",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}

async function handleAcceptButton(
  interaction: any,
  env: Env,
  customId: string
): Promise<Response> {
  const demandeId = parseInt(customId.replace("accept_", ""));

  try {
    const { getPrismaClient } = await import("../services/database.js");
    const prisma = getPrismaClient(env.DATABASE_URL);

    // Update request to PAIEMENT type (approved for payment)
    const demande = await prisma.demande.update({
      where: { id: demandeId },
      data: { type: "PAIEMENT" },
    });

    // Send DM to requester
    const dmContent = {
      content:
        `✅ **Votre demande a été acceptée!**\n\n` +
        `**Nom:** ${demande.name}\n` +
        `**Montant:** ${demande.montant}€\n\n` +
        `Vous pouvez maintenant:\n` +
        `• Confirmer le paiement avec la carte de l'association: \`/confirme nom:${demande.name} montant:${demande.montant}\` + facture PDF\n` +
        `• OU demander un remboursement après paiement avec votre carte: \`/remboursement nom:${demande.name} montant:${demande.montant}\` + facture PDF`,
    };

    await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ recipient_id: demande.userId }),
    })
      .then((res) => res.json())
      .then((channel: any) =>
        fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
          },
          body: JSON.stringify(dmContent),
        })
      );

    // Update the message to show it was accepted
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          content: interaction.message.content + "\n\n✅ **ACCEPTÉE**",
          components: [], // Remove buttons
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error accepting request:", error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "❌ Une erreur est survenue",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

async function handleDenyButton(
  interaction: any,
  env: Env,
  customId: string
): Promise<Response> {
  const demandeId = parseInt(customId.replace("deny_", ""));

  try {
    const { getPrismaClient } = await import("../services/database.js");
    const prisma = getPrismaClient(env.DATABASE_URL);

    // Update request status to DENIED
    const demande = await DemandeService.validateDemande(
      prisma,
      demandeId,
      "DENIED"
    );

    // Send DM to requester
    const dmContent = {
      content:
        `❌ **Votre demande a été refusée**\n\n` +
        `**Nom:** ${demande.name}\n` +
        `**Montant:** ${demande.montant}€\n\n` +
        `Contactez le trésorier pour plus d'informations.`,
    };

    await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ recipient_id: demande.userId }),
    })
      .then((res) => res.json())
      .then((channel: any) =>
        fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
          },
          body: JSON.stringify(dmContent),
        })
      );

    // Update the message to show it was denied
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          content: interaction.message.content + "\n\n❌ **REFUSÉE**",
          components: [], // Remove buttons
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error denying request:", error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "❌ Une erreur est survenue",
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}
