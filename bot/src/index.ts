/**
 * Main Cloudflare Worker entry point
 * Handles Discord interactions via HTTP
 */

import { Router } from "itty-router";
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions";
import { handleDemandeCommand } from "./handlers/demande.js";
import { handleConfirmeCommand } from "./handlers/confirme.js";
import { handleRemboursementCommand } from "./handlers/remboursement.js";
import { handleButtonInteraction } from "./handlers/buttons.js";
import type { Env } from "./types.js";

// Lazy-load handlers to avoid importing Prisma at module load time
// This is important for the health check endpoint to work without database dependencies
const loadHandlers = async () => {
  const [demande, confirme, remboursement, buttons] = await Promise.all([
    import("./handlers/demande.js"),
    import("./handlers/confirme.js"),
    import("./handlers/remboursement.js"),
    import("./handlers/buttons.js"),
  ]);
  return {
    handleDemandeCommand: demande.handleDemandeCommand,
    handleConfirmeCommand: confirme.handleConfirmeCommand,
    handleRemboursementCommand: remboursement.handleRemboursementCommand,
    handleButtonInteraction: buttons.handleButtonInteraction,
  };
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (request.method === "GET" && url.pathname === "/") {
      const appId = env?.DISCORD_APPLICATION_ID || "not configured";
      return new Response(`👋 Discord Bot is running! App ID: ${appId}`);
    }

    // Discord interactions endpoint
    if (request.method === "POST") {
      try {
        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();

        console.log(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);

        // Verify request signature
        const isValidRequest =
          signature &&
          timestamp &&
          (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));

        if (!isValidRequest) {
          console.error("Invalid request signature");
          return new Response("Bad request signature", { status: 401 });
        }

        const interaction = JSON.parse(body);

        // Handle PING from Discord
        if (interaction.type === InteractionType.PING) {
          return new Response(
            JSON.stringify({ type: InteractionResponseType.PONG }),
            {
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Lazy-load handlers only when needed (not for PING or health check)
        const handlers = await loadHandlers();

        // Handle slash commands
        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
          const { name } = interaction.data;

          switch (name) {
            case "demande":
              return handlers.handleDemandeCommand(interaction, env);
            case "confirme":
              return handlers.handleConfirmeCommand(interaction, env);
            case "remboursement":
              return handlers.handleRemboursementCommand(interaction, env);
            default:
              return new Response(
                JSON.stringify({
                  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: {
                    content: "❌ Commande non reconnue",
                    flags: 64,
                  },
                }),
                { headers: { "Content-Type": "application/json" } }
              );
          }
        }

        // Handle button interactions
        if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
          return handlers.handleButtonInteraction(interaction, env);
        }

        console.error("Unknown interaction type:", interaction.type);
        return new Response("Unknown interaction type", { status: 400 });
      } catch (err) {
        console.error("Error handling POST request:", err);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    // 404 for all other routes
    return new Response("Not Found", { status: 404 });
  },
};
