import { fetchDailyMessagesReport } from "../report/fetchDailyMessages";

import { config } from "dotenv";

config({ path: ".dev.vars" });

fetchDailyMessagesReport(process.env, process.env.GUILD_ID);
