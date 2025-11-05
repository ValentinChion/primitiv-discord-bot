import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextInputBuilder,
  ModalBuilder,
  TextInputStyle,
} from 'discord.js';
import { DemandeService } from '../services/database';
import dotenv from 'dotenv';

dotenv.config();

export async function handleDemande(message: Message, args: string[]) {
  if (args.length < 2) {
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Utilisation : `!demande [nom] [montant] [description]`'),
      ],
    });
  }

  const [name, montantStr, ...descriptionParts] = args;
  const montant = parseFloat(montantStr);
  const description = descriptionParts.join(' ');

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
    const isAlreadyCreated = await DemandeService.checkDemandeExists(name);
    if (isAlreadyCreated) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ffaa00') // Orange pour un avertissement
            .setTitle('⚠️ Demande existante')
            .setDescription(`Une demande avec le nom **${name}** existe déjà.`)
            .addFields(
              { name: 'Solution 1', value: 'Utilisez un nom différent pour cette demande.', inline: false },
              {
                name: 'Solution 2',
                value: 'Si vous souhaitez modifier la demande existante, contactez un administrateur.',
                inline: false,
              }
            )
            .setFooter({ text: 'Les noms de demande doivent être uniques.' }),
        ],
      });
    }

    const demande = await DemandeService.createDemande(name, message.author.id, montant, description);

    // Envoyer un DM au trésorier avec une modale
    const treasurer = await message.client.users.fetch(process.env.TRESORIER_ID as string); // Remplacez par l'ID réel
    const modal = new ModalBuilder()
      .setCustomId(`validate_demande_${demande.id}`)
      .setTitle(`Valider la demande #${demande.id}`);

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Raison du refus (si refusé)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
    modal.addComponents(firstActionRow);

    await treasurer.send({
      content: `Nouvelle demande #${demande.id} de <@${message.author.id}> : **${montant}€** - "${description}"`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setCustomId(`accept_${demande.id}`).setLabel('Accepter').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`deny_${demande.id}`).setLabel('Refuser').setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Demande enregistrée')
          .setDescription(
            `Votre demande **${name}** (#${demande.id}) a été enregistrée : **${montant}€** pour *«${description}*».`
          )
          .setFooter({ text: 'Un administrateur va la valider sous peu.' }),
      ],
    });
  } catch (error) {
    console.error('Erreur création demande:', error);
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
