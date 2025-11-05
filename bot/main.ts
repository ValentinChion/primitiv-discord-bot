import {
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  GuildChannel,
} from 'discord.js';
import { handleDemande } from './commands/demande';
import { handleConfirm } from './commands/confirme';
import { handleRemboursement } from './commands/remboursement';
import { prisma } from './services/database';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`🔵 Bot connecté en tant que ${client.user?.tag}`);
});

client.on('messageCreate', async (message) => {
  console.log(`[MSG] De: ${message.author.tag} | Guild: ${message.guild?.name || 'DM'} | Contenu: ${message.content}`);
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  const channelName = (message.channel as GuildChannel)?.name;
  console.log(channelName);

  try {
    if (command && ['demande', 'confirme', 'remboursement'].includes(command) && !channelName.includes('facture')) {
      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Channel non autorisé')
            .setDescription(`Cette commande ne peut être utilisée que dans le channel facture.`)
            .setFooter({ text: 'Veuillez vous rendre dans le bon channel pour utiliser cette commande.' }),
        ],
      });
    } else {
      console.log(`Command found: !${command}, starting execution`);
      if (command === 'demande') {
        await handleDemande(message, args);
      } else if (command === 'confirme') {
        await handleConfirm(message, args);
      } else if (command === 'remboursement') {
        await handleRemboursement(message, args);
      }
    }
  } catch (error) {
    console.error('Erreur commande:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    const [action, id] = interaction.customId.split('_');

    if (action === 'accept') {
      // Accepter une demande
      await prisma.demande.update({
        where: { id: parseInt(id) },
        data: { type: 'PAIEMENT', statut: 'PENDING' },
      });

      // Envoyer un DM à l'utilisateur
      const demande = await prisma.demande.findUnique({ where: { id: parseInt(id) } });
      const user = await client.users.fetch(demande!.userId);
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎉 Demande validée')
            .setDescription(
              `Votre demande **#${id}** a été validée. Vous pouvez maintenant :
            - **Payer avec la carte de l'association** : utilisez \`!confirm [nom_demande] [montant_exact] + [facture]\`
            - **Payer avec votre carte personnelle** : utilisez \`!remboursement [nom_demande] [montant_exact] + [facture]\`
            \n⚠️ **La facture est OBLIGATOIRE** dans les deux cas.`
            )
            .setFooter({ text: "Merci d'utiliser le bot ❤️" }),
        ],
      });

      await interaction.reply({
        content: `Demande #${id} acceptée. L'utilisateur a été notifié.`,
        ephemeral: true,
      });
    } else if (action === 'deny') {
      // Refuser une demande
      const modal = new ModalBuilder().setCustomId(`deny_modal_${id}`).setTitle(`Refuser la demande #${id}`);

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Raison du refus')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput));
      await interaction.showModal(modal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('deny_modal_')) {
      const id = interaction.customId.split('_')[2];
      const reason = interaction.fields.getTextInputValue('reason');

      // Refuser la demande
      await prisma.demande.update({
        where: { id: parseInt(id) },
        data: { statut: 'DENIED' },
      });

      // Notifier l'utilisateur
      const demande = await prisma.demande.findUnique({ where: { id: parseInt(id) } });
      const user = await client.users.fetch(demande!.userId);
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Demande refusée')
            .setDescription(`Votre demande **#${id}** a été refusée.\n**Raison** : ${reason}`),
        ],
      });

      await interaction.reply({
        content: `Demande #${id} refusée. L'utilisateur a été notifié.`,
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
