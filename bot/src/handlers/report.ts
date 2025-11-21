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

  const claudeResult = await analyzeReport(report);

  if (sendToDiscord) {
    for (const message of claudeResult) {
      await sendDiscordMessage("1441436717004624016", message);
    }
  }

  return claudeResult;
};
