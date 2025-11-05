import { Message, EmbedBuilder } from 'discord.js';
import { DemandeService, prisma } from '../services/database';
import { uploadToDrive } from '../services/googleDrive';

export async function handleRemboursement(message: Message, args: string[]) {
  if (args.length < 2) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Utilisation : `!remboursement [nom_demande] [montant_exact] + [facture.pdf]`'),
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

    if (demande.statut !== 'VALIDATED' || demande.type !== 'DEMANDE') {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Erreur')
            .setDescription("Cette demande n'est pas éligible à un remboursement."),
        ],
      });
    }

    // Upload de la facture sur Google Drive
    const factureUrl = await uploadToDrive(
      attachment,
      process.env.GOOGLE_DRIVE_FOLDER_ID!,
      `remboursement_${demande.id}_${attachment.name}`
    );

    // Créer une demande de remboursement
    const remboursement = await DemandeService.createRemboursement(message.author.id, demande.id, montant, factureUrl);

    // Envoyer un DM au trésorier
    const treasurer = await message.client.users.fetch(process.env.TRESORIER_ID as string);
    await treasurer.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`💰 Nouvelle demande de remboursement #${remboursement.id}`)
          .setDescription(
            `**Membre** : <@${message.author.id}>\n**Montant** : ${montant}€\n**Pour la demande** : #${demande.id} (${demande.description})`
          )
          .setFooter({ text: 'Utilisez les boutons pour traiter cette demande.' }),
      ],
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Demande de remboursement enregistrée')
          .setDescription(`Votre demande de remboursement **#${remboursement.id}** a été enregistrée.`)
          .setFooter({ text: 'Un administrateur va la traiter sous peu.' }),
      ],
    });
  } catch (error) {
    console.error('Erreur remboursement:', error);
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
