import { InteractionResponseType } from 'discord-interactions';

export async function handleHelpCommand(): Promise<Response> {
  const content = [
    "## Commandes disponibles",
    "",
    "### `/demande`",
    "Créer une nouvelle demande de dépense.",
    "**Paramètres :**",
    "- `nom` *(obligatoire)* — Nom unique de la demande (ex: `achat_stylos`)",
    "- `montant` *(obligatoire)* — Montant en euros",
    "- `description` *(obligatoire)* — Description de la demande",
    "- `facture` *(optionnel)* — Devis ou facture en pièce jointe",
    "",
    "### `/help`",
    "Afficher ce message.",
  ].join("\n");

  return new Response(
    JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content, flags: 64 },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
