import chalk from "chalk";
import { DailyMessage, getDailyChannelMessages } from "../services/messages.js";
import type { Env } from "../types.js";
import { callClaude } from "../services/claude.js";

interface DailyReport {
  date: string;
  totalChannels: number;
  totalMessages: number;
  messagesByChannel: Record<
    string,
    { total: number; messages: DailyMessage[] }
  >;
  activeUsers: string[];
}

/**
 * Generate daily report
 */
export async function fetchDailyMessagesReport(
  env: Env,
  guildId: string
): Promise<DailyReport> {
  console.log(chalk.cyan.bold("\n📊 Generating daily activity report..."));

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const messages = await getDailyChannelMessages(guildId, yesterday, env);

  // Generate statistics
  const report = {
    date: yesterday.toISOString().split("T")[0],
    totalChannels: Object.keys(messages).length,
    totalMessages: 0,
    messagesByChannel: {} as Record<
      string,
      { total: number; messages: DailyMessage[] }
    >,
    activeUsers: new Set<string>(),
  };

  for (const [channelName, channelMessages] of Object.entries(messages)) {
    report.totalMessages += channelMessages.length;
    report.messagesByChannel[channelName] = {
      messages: channelMessages,
      total: channelMessages.length,
    };

    // Track unique users
    channelMessages.forEach((msg) => report.activeUsers.add(msg.user));
  }

  console.log(chalk.cyan.bold("\n" + "=".repeat(50)));
  console.log(chalk.cyan.bold("📊 Daily Activity Report"));
  console.log(chalk.cyan.bold("=".repeat(50)));
  console.log(chalk.white(`📅 Date: ${chalk.bold(report.date)}`));
  console.log(
    chalk.green(`💬 Total Messages: ${chalk.bold(report.totalMessages)}`)
  );
  console.log(
    chalk.blue(`📢 Active Channels: ${chalk.bold(report.totalChannels)}`)
  );
  console.log(
    chalk.magenta(`👥 Active Users: ${chalk.bold(report.activeUsers.size)}`)
  );
  console.log(chalk.cyan("\n" + "─".repeat(50)));
  console.log(chalk.yellow.bold("Messages per channel:"));
  console.log(chalk.cyan("─".repeat(50)));

  Object.entries(report.messagesByChannel)
    .sort(([, a], [, b]) => b - a)
    .forEach(([channel, count]) => {
      console.log(
        chalk.white(
          `  ${chalk.blue("#" + channel)}: ${chalk.bold.green(count)}`
        )
      );
    });

  console.log(chalk.cyan("=".repeat(50) + "\n"));

  return {
    ...report,
    activeUsers: Array.from(report.activeUsers),
  };
}

export const analyzeReport = async (report: DailyReport) => {
  console.log(chalk.cyan.bold("\n📊 Calling Claude to analyze report..."));

  const result = await callClaude(
    `
    You will find below a daily report of messages sent in our Discord server.
    This Discord server is used to organize a community of people organizing events focused on electronic music.
    It can be parties, raves, festivals etc... The community is called "PRIMITIV". We are based in Paris, France.
    The DJ group is called "BTK"
    Here are the events we organize : 
        - Ekotone (A festival)
        - Synergy (Electronic parties in clubs mainly)
        - BTK and friends (Electronic small parties)
    
    Please analyze the report and provide a summary of the activity in the server.
    You MUST ignore messages that are only emojis, only mentions, and messages that are "funny" or "meme" related.
    You should try to ignore messages that are not related to the community or the events.

    This should follow the format of a discord message since it will then be sent to the server.
    You can use markdown to format the message.
    The message length (without markdown) should be less than 300 characters. Try be as concise as possible.

    At the end, you should add mentions of the most active channels, with the following format #channel_name (2 max) (Not added in the 300 characters limit)

    You should answer in french only with the content of the message to be usable in my code.
    `,
    report,
    {
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: "claude-haiku-4-5-20251001",
    }
  );

  console.log(chalk.cyan.bold("\n📊 Report analysis result :"));
  console.log(chalk.white(result.content));
};
