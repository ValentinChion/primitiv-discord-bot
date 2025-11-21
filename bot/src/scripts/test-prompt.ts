import {
  analyzeReport,
  fetchDailyMessagesReport,
} from "../report/fetchDailyMessages";

import { config } from "dotenv";
import { sendDiscordMessage } from "../services/sendMessage";

config({ path: ".dev.vars" });

const main = async () => {
  const claudeResult = await analyzeReport({
    date: "2024-01-01",
    totalChannels: 1,
    totalMessages: 2,
    messagesByChannel: {
      test: {
        total: 2,
        messages: [
          {
            message: "Hello",
            user: "Test",
            date: "2024-01-01T00:00:00.000Z",
          },
          {
            message: "We need to discuss about Ekotone",
            user: "Other User",
            date: "2024-01-01T00:05:00.000Z",
          },
        ],
      },
    },
    activeUsers: ["Test", "Other User"],
  });

  console.log(claudeResult);
};

main();
