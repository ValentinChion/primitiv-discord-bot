import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { config } from "dotenv";
import { sendDiscordMessage } from "../services/sendMessage";

config({ path: ".dev.vars" });

const main = async () => {
  // Parse command line arguments
  const sendToDiscord = process.argv.includes("--send-discord");

  const report = await fetchDailyMessagesReport(
    process.env,
    process.env.GUILD_ID
  );

  console.log(report);

  const claudeResult = await analyzeReport(report);

  console.log(claudeResult);

  if (sendToDiscord) {
    for (const message of claudeResult) {
      await sendDiscordMessage("1441436717004624016", message);
    }
  }
};

main();
