import chalk from 'chalk';
import { getDailyChannelMessages } from "../services/messages.js";
import type { Env } from "../types.js";

/**
 * Generate daily report
 */
export async function fetchDailyMessagesReport(env: Env, guildId: string) {
  console.log(chalk.cyan.bold("\n📊 Generating daily activity report..."));

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const messages = await getDailyChannelMessages(guildId, yesterday, env);

  // Generate statistics
  const report = {
    date: yesterday.toISOString().split("T")[0],
    totalChannels: Object.keys(messages).length,
    totalMessages: 0,
    messagesByChannel: {} as Record<string, number>,
    activeUsers: new Set<string>(),
  };

  for (const [channelName, channelMessages] of Object.entries(messages)) {
    report.totalMessages += channelMessages.length;
    report.messagesByChannel[channelName] = channelMessages.length;

    // Track unique users
    channelMessages.forEach((msg) => report.activeUsers.add(msg.user));
  }

  console.log(chalk.cyan.bold("\n" + "=".repeat(50)));
  console.log(chalk.cyan.bold("📊 Daily Activity Report"));
  console.log(chalk.cyan.bold("=".repeat(50)));
  console.log(chalk.white(`📅 Date: ${chalk.bold(report.date)}`));
  console.log(chalk.green(`💬 Total Messages: ${chalk.bold(report.totalMessages)}`));
  console.log(chalk.blue(`📢 Active Channels: ${chalk.bold(report.totalChannels)}`));
  console.log(chalk.magenta(`👥 Active Users: ${chalk.bold(report.activeUsers.size)}`));
  console.log(chalk.cyan("\n" + "─".repeat(50)));
  console.log(chalk.yellow.bold("Messages per channel:"));
  console.log(chalk.cyan("─".repeat(50)));

  Object.entries(report.messagesByChannel)
    .sort(([, a], [, b]) => b - a)
    .forEach(([channel, count]) => {
      console.log(chalk.white(`  ${chalk.blue('#' + channel)}: ${chalk.bold.green(count)}`));
    });

  console.log(chalk.cyan("=".repeat(50) + "\n"));

  return {
    ...report,
    activeUsers: Array.from(report.activeUsers),
  };
}
