import { getDailyChannelMessages } from "../services/messages.js";
import type { Env } from "../types.js";

/**
 * Generate daily report
 */
export async function fetchDailyMessagesReport(env: Env, guildId: string) {
  console.log("Example 6: Generating daily activity report");

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

  console.log("\n📊 Daily Activity Report");
  console.log(`Date: ${report.date}`);
  console.log(`Total Messages: ${report.totalMessages}`);
  console.log(`Active Channels: ${report.totalChannels}`);
  console.log(`Active Users: ${report.activeUsers.size}`);
  console.log("\nMessages per channel:");

  Object.entries(report.messagesByChannel)
    .sort(([, a], [, b]) => b - a)
    .forEach(([channel, count]) => {
      console.log(`  #${channel}: ${count}`);
    });

  return {
    ...report,
    activeUsers: Array.from(report.activeUsers),
  };
}
