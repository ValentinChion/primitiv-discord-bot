/**
 * Handler for /demande slash command
 * Creates a new financial request
 */

import { InteractionResponseType, MessageComponentTypes, ButtonStyleTypes } from 'discord-interactions';
import { DemandeService } from '../services/database.js';
import type { Env } from '../types.js';

export async function handleDemandeCommand(
  interaction: any,
  env: Env
): Promise<Response> {
  const { options, member } = interaction.data;
  const userId = interaction.member?.user?.id || interaction.user?.id;

  // Extract command options
  const nom = options.find((opt: any) => opt.name === 'nom')?.value;
  const montant = options.find((opt: any) => opt.name === 'montant')?.value;
  const description = options.find((opt: any) => opt.name === 'description')?.value;

  // Validate inputs
  if (!nom || !montant || !description) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Tous les paramètres sont requis: nom, montant, description',
          flags: 64, // Ephemeral
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (montant <= 0) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Le montant doit être positif',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { getPrismaClient } = await import('../services/database.js');
    const prisma = getPrismaClient(env.DATABASE_URL);

    // Check if request name already exists
    const exists = await DemandeService.checkDemandeExists(prisma, nom);
    if (exists) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Une demande avec le nom "${nom}" existe déjà. Veuillez choisir un nom unique.`,
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the request
    const demande = await DemandeService.createDemande(prisma, nom, userId, montant, description);

    // Send DM to treasurer with accept/deny buttons
    const dmContent = {
      content: `📋 **Nouvelle demande de dépense**\n\n` +
        `**Nom:** ${nom}\n` +
        `**Montant:** ${montant}€\n` +
        `**Description:** ${description}\n` +
        `**Demandeur:** <@${userId}>\n` +
        `**ID:** #${demande.id}`,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.SUCCESS,
              label: 'Accepter',
              custom_id: `accept_${demande.id}`,
            },
            {
              type: MessageComponentTypes.BUTTON,
              style: ButtonStyleTypes.DANGER,
              label: 'Refuser',
              custom_id: `deny_${demande.id}`,
            },
          ],
        },
      ],
    };

    // Send DM to treasurer
    await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ recipient_id: env.TRESORIER_ID }),
    })
      .then((res) => res.json())
      .then((channel: any) =>
        fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
          },
          body: JSON.stringify(dmContent),
        })
      );

    // Respond to user
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Demande "${nom}" enregistrée avec succès! (ID: #${demande.id})\nLe trésorier a été notifié.`,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating demande:', error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Une erreur est survenue lors de la création de la demande.',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
