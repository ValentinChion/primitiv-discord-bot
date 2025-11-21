import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { sendDiscordMessage } from "../services/sendMessage";
import type { Env } from "../types";

/**
 * Generate and optionally send the daily report
 * Can be called from CLI or from a Cloudflare Worker scheduled event
 */
export const generateReport = async (env: any, sendToDiscord: boolean = false) => {
  const report = await fetchDailyMessagesReport(
    env,
    env.GUILD_ID
  );

  console.log(report);

  const claudeResult = await analyzeReport(report);

  console.log(claudeResult);

  if (sendToDiscord) {
    for (const message of claudeResult) {
      await sendDiscordMessage("1441436717004624016", message);
    }
  }

  return claudeResult;
};

const main = async () => {
  // Load dotenv only when running as CLI
  const { config } = await import("dotenv");
  config({ path: ".dev.vars" });

  // Parse command line arguments
  const sendToDiscord = process.argv.includes("--send-discord");

  await generateReport(process.env, sendToDiscord);
};

// Only run main() if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
