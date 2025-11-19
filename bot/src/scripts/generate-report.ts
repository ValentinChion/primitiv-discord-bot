import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { config } from "dotenv";

config({ path: ".dev.vars" });

const main = async () => {
  const report = await fetchDailyMessagesReport(
    process.env,
    process.env.GUILD_ID
  );

  console.log(report);

  const claudeResult = await analyzeReport(report);

  console.log(claudeResult);
};

main();
