import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { config } from "dotenv";

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

  // Send message to Discord if requested
  if (sendToDiscord) {
    // TODO: Implement Discord message sending
  }
};

main();
