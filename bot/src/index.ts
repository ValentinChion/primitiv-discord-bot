/**
 * Main Cloudflare Worker entry point
 * Handles Discord interactions via HTTP
 */

import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from "discord-interactions";
import type { Env } from "./types.js";
import { generateReport } from "./handlers/report.js";

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
  /**
   * Scheduled handler for cron triggers
   * Runs the daily report generation and sends it to Discord
   */
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Scheduled event triggered:", event.cron);

    try {
      // Run the report with sendToDiscord=true
      await generateReport(env, true);

      console.log("Daily report generated and sent successfully");
    } catch (error) {
      console.error("Error generating scheduled report:", error);
      throw error;
    }
  },

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

    // Manual trigger endpoint for report generation
    if (request.method === "POST" && url.pathname === "/generate-report") {
      try {
        // Import the report generation function
        const { generateReport } = await import("./scripts/generate-report.js");

        // Run the report with sendToDiscord=true
        const result = await generateReport(env, true);

        return new Response(
          JSON.stringify({
            success: true,
            message: "Report generated and sent to Discord",
            preview: result[0]?.substring(0, 200) + "...",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (error) {
        console.error("Error generating manual report:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
    }

    // Discord interactions endpoint
    if (request.method === "POST") {
      try {
        const signature = request.headers.get("x-signature-ed25519");
        const timestamp = request.headers.get("x-signature-timestamp");
        const body = await request.text();

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
