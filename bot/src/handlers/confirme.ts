/**
 * Handler for /confirme slash command
 * Confirms a payment with association card
 */

import { InteractionResponseType } from 'discord-interactions';
import { DemandeService } from '../services/database.js';
import { uploadToDrive, downloadFromDiscord } from '../services/googleDrive.js';
import type { Env } from '../types.js';

export async function handleConfirmeCommand(
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
            content: '❌ Vous ne pouvez confirmer que vos propres demandes',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate status
    if (demande.statut !== 'PENDING') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Cette demande n\'est pas en attente de confirmation',
            flags: 64,
          },
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate type
    if (demande.type !== 'PAIEMENT') {
      return new Response(
        JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Cette demande n\'a pas été validée pour paiement. Attendez la validation du trésorier.',
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
      `${nom}_${Date.now()}.pdf`,
      'application/pdf',
      env.GOOGLE_DRIVE_FOLDER_ID,
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      env.GOOGLE_PRIVATE_KEY
    );

    // Create payment record
    await DemandeService.createPaiement(prisma, demande.id, montant, uploadResult.webViewLink);

    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `✅ Paiement confirmé pour la demande "${nom}"!\n📎 Facture: ${uploadResult.webViewLink}`,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error confirming payment:', error);
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: '❌ Une erreur est survenue lors de la confirmation du paiement.',
          flags: 64,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
