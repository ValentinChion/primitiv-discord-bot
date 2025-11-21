import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { sendDiscordMessage } from "../services/sendMessage";

/**
 * Generate and optionally send the daily report
 * Can be called from CLI or from a Cloudflare Worker scheduled event
 */
export const generateReport = async (
  env: any,
  sendToDiscord: boolean = false
) => {
  const report = await fetchDailyMessagesReport(env, env.GUILD_ID);

  const claudeResult = await analyzeReport(report);

  if (sendToDiscord) {
    for (const message of claudeResult) {
      await sendDiscordMessage("1441436717004624016", message);
    }
  }

  return claudeResult;
};
