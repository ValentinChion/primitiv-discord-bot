/**
 * Handler for /remboursement slash command
 * Requests reimbursement for personal card payment
 */

import { InteractionResponseType } from 'discord-interactions';
import { DemandeService } from '../services/database.js';
import { uploadToDrive, downloadFromDiscord } from '../services/googleDrive.js';
import type { Env } from '../types.js';

export async function handleRemboursementCommand(
  interaction: any,
  env: Env
): Promise<Response> {
  const { options, resolved } = interaction.data;
  const userId = interaction.member?.user?.id || interaction.user?.id;

  // Extract command options
  const nom = options.find((opt: any) => opt.name === 'nom')?.value;
  const montant = options.find((opt: any) => opt.name === 'montant')?.value;
  const attachmentId = options.find((opt: any) => opt.name === 'facture')?.value;

  if (!nom || !montant || !attachmentId) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Tous les paramètres sont requis: nom, montant, facture',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  const attachment = resolved?.attachments?.[attachmentId];
  if (!attachment) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Fichier non trouvé',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate PDF
  if (!attachment.content_type?.includes('pdf')) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Le fichier doit être un PDF',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { getPrismaClient } = await import('../services/database.js');
    const prisma = getPrismaClient(env.DATABASE_URL);

    // Get the request
    const demande = await DemandeService.getDemandeByName(prisma, nom);

    if (!demande) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Aucune demande trouvée avec le nom "${nom}"`,
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate ownership
    if (demande.userId !== userId) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Vous ne pouvez demander le remboursement que pour vos propres demandes',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate status
    if (demande.statut !== 'VALIDATED') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Cette demande n\'a pas encore été validée par le trésorier',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate type
    if (demande.type !== 'DEMANDE') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Cette demande a déjà été traitée',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (Math.abs(demande.montant - montant) > 0.01) {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `❌ Le montant ne correspond pas. Montant attendu: ${demande.montant}€`,
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Download and upload file to Google Drive
    const fileBuffer = await downloadFromDiscord(attachment.url);
    const uploadResult = await uploadToDrive(
      fileBuffer,
      `remboursement_${nom}_${Date.now()}.pdf`,
      'application/pdf',
      env.GOOGLE_DRIVE_FOLDER_ID,
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      env.GOOGLE_PRIVATE_KEY
    );

    // Create reimbursement request
    const remboursement = await DemandeService.createRemboursement(
      prisma,
      userId,
      demande.id,
      montant,
      uploadResult.webViewLink
    );

    // Send DM to treasurer
    const dmContent = {
      content: `💰 **Demande de remboursement**\n\n` +
        `**Demande originale:** ${nom} (#${demande.id})\n` +
        `**Montant:** ${montant}€\n` +
        `**Demandeur:** <@${userId}>\n` +
        `**Facture:** ${uploadResult.webViewLink}\n` +
        `**ID remboursement:** #${remboursement.id}`,
    };

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

    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Demande de remboursement enregistrée! (ID: #${remboursement.id})\n📎 Facture: ${uploadResult.webViewLink}\n\nLe trésorier a été notifié.`,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating reimbursement:', error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Une erreur est survenue lors de la création de la demande de remboursement.',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
