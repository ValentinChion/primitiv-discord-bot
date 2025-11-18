/**
 * Main Cloudflare Worker entry point
 * Handles Discord interactions via HTTP
 */

import { Router } from 'itty-router';
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from 'discord-interactions';
import { handleDemandeCommand } from './handlers/demande.js';
import { handleConfirmeCommand } from './handlers/confirme.js';
import { handleRemboursementCommand } from './handlers/remboursement.js';
import { handleButtonInteraction } from './handlers/buttons.js';
import type { Env } from './types.js';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/', (request, env: Env) => {
  return new Response(`👋 Discord Bot is running! App ID: ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main Discord interactions endpoint
 */
router.post('/', async (request, env: Env) => {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.clone().text();

  // Verify request signature
  const isValidRequest = signature && timestamp &&
    verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

  if (!isValidRequest) {
    console.error('Invalid request signature');
    return new Response('Bad request signature', { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle PING from Discord
  if (interaction.type === InteractionType.PING) {
    return new Response(
      JSON.stringify({ type: InteractionResponseType.PONG }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Handle slash commands
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name } = interaction.data;

    switch (name) {
      case 'demande':
        return handleDemandeCommand(interaction, env);
      case 'confirme':
        return handleConfirmeCommand(interaction, env);
      case 'remboursement':
        return handleRemboursementCommand(interaction, env);
      default:
        return new Response(
          JSON.stringify({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '❌ Commande non reconnue',
              flags: 64,
            },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
    }
  }

  // Handle button interactions
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    return handleButtonInteraction(interaction, env);
  }

  console.error('Unknown interaction type:', interaction.type);
  return new Response('Unknown interaction type', { status: 400 });
});

/**
 * 404 handler
 */
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request, env, ctx),
};
