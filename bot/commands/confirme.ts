import { Message, EmbedBuilder } from 'discord.js';
import { DemandeService, prisma } from '../services/database';
import { uploadToDrive } from '../services/googleDrive';

export async function handleConfirm(message: Message, args: string[]) {
  if (args.length < 2) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Utilisation : `!confirme [nom_demande] [montant_exact] + [facture.pdf]`'),
      ],
    });
  }

  const [name, montantStr] = args;
  const montant = parseFloat(montantStr);
  const attachment = message.attachments.first();

  if (!attachment) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Veuillez joindre une facture (PDF).'),
      ],
    });
  }

  if (isNaN(montant) || montant <= 0) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Le montant doit être un nombre positif.'),
      ],
    });
  }

  try {
    // Vérifier que la demande existe
    const demande = await prisma.demande.findUnique({
      where: { name },
    });

    if (!demande) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Erreur')
            .setDescription(`Aucune demande trouvée avec le nom "${name}".`),
        ],
      });
    }

    if (demande.userId !== message.author.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Erreur')
            .setDescription("Vous n'êtes pas le propriétaire de cette demande."),
        ],
      });
    }

    if (demande.statut !== 'PENDING' || demande.type !== 'PAIEMENT') {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Erreur')
            .setDescription("Cette demande n'est pas en attente de confirmation."),
        ],
      });
    }

    // Upload de la facture sur Google Drive
    const factureUrl = await uploadToDrive(
      attachment,
      process.env.GOOGLE_DRIVE_FOLDER_ID!,
      `facture_${demande.id}_${attachment.name}`
    );

    // Mettre à jour la demande
    await DemandeService.validateDemande(demande.id, 'VALIDATED');
    await prisma.demande.update({
      where: { id: demande.id },
      data: { factureUrl },
    });

    // Créer un paiement associé
    await DemandeService.createPaiement(demande.id, montant, factureUrl);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Demande confirmée')
          .setDescription(`Votre demande **${name}** a été confirmée avec succès.`)
          .setFooter({ text: "Merci d'utiliser le bot ❤️" }),
      ],
    });
  } catch (error) {
    console.error('Erreur confirmation:', error);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⚠️ Erreur')
          .setDescription('Une erreur est survenue. Veuillez réessayer.'),
      ],
    });
  }
}
