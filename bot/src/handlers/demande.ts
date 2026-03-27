/**
 * Handler for /demande slash command
 * Creates a new financial request
 */

import { InteractionResponseType } from 'discord-interactions';
import { DemandeService } from '../services/database.js';
import { uploadToR2, downloadFromDiscord } from '../services/storage.js';
import type { Env } from '../types.js';

export async function handleDemandeCommand(
  interaction: any,
  env: Env
): Promise<Response> {
  const { options, member } = interaction.data;
  const userId = interaction.member?.user?.id || interaction.user?.id;
  const discordUsername = interaction.member?.user?.username || interaction.user?.username;

  // Extract command options
  const nom = options.find((opt: any) => opt.name === 'nom')?.value;
  const montant = options.find((opt: any) => opt.name === 'montant')?.value;
  const description = options.find((opt: any) => opt.name === 'description')?.value;
  const attachmentId = options.find((opt: any) => opt.name === 'facture')?.value;
  const attachment = attachmentId ? interaction.data.resolved?.attachments?.[attachmentId] : null;

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

    // Upload attachment to Google Drive if provided
    let factureUrl: string | undefined;
    if (attachment) {
      const fileBuffer = await downloadFromDiscord(attachment.url);
      const uploadResult = await uploadToR2(
        env.FILES_BUCKET,
        fileBuffer,
        `${nom}_${Date.now()}_${attachment.filename}`,
        attachment.content_type || 'application/octet-stream',
        env.R2_PUBLIC_URL
      );
      factureUrl = uploadResult.url;
    }

    // Create the request
    const demande = await DemandeService.createDemande(prisma, nom, userId, montant, description, factureUrl, discordUsername);

    // Send DM to treasurer
    const dmContent = {
      content: `📋 **Nouvelle demande de dépense**\n\n` +
        `**Nom:** ${nom}\n` +
        `**Montant:** ${montant}€\n` +
        `**Description:** ${description}\n` +
        `**Demandeur:** <@${userId}>\n` +
        `**ID:** #${demande.id}` +
        (factureUrl ? `\n**Fichier:** ${factureUrl}` : ''),
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
