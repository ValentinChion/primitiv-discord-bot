import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { sendDiscordMessage } from "../services/sendMessage";
import { Env } from "../types";

/**
 * Generate and optionally send the daily report
 * Can be called from CLI or from a Cloudflare Worker scheduled event
 */
export const generateReport = async (
  env: Env,
  sendToDiscord: boolean = false
) => {
  const report = await fetchDailyMessagesReport(env);

  // Check if there were any messages
  let claudeResult: string[];
  if (report.totalMessages === 0) {
    // No messages today, send a simple announcement
    const date = report.date;
    claudeResult = [
      `📊 **Rapport quotidien du ${date}**\n\nAucun message n'a été envoyé aujourd'hui sur le serveur.`
    ];
  } else {
    // Messages exist, analyze them with Claude
    claudeResult = await analyzeReport(report, env);
  }

  if (sendToDiscord) {
    for (const message of claudeResult) {
      await sendDiscordMessage("1441436717004624016", message, env);
    }
  }

  return claudeResult;
};
