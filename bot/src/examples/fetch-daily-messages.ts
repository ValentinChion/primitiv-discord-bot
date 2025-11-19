/**
 * Example usage of the getDailyChannelMessages function
 *
 * This demonstrates how to fetch all messages from all channels for a specific day
 */

import {
  getDailyChannelMessages,
  getYesterdayChannelMessages,
  getChannelMessagesByDateString,
  type DailyChannelMessages,
} from '../services/messages.js';
import type { Env } from '../types.js';

/**
 * Example 1: Fetch messages for a specific date
 */
export async function example1(env: Env, guildId: string) {
  console.log('Example 1: Fetching messages for November 18, 2025');

  // Create a date object for November 18, 2025
  const targetDate = new Date('2025-11-18');

  // Fetch all messages from all channels for that day
  const messages = await getDailyChannelMessages(guildId, targetDate, env);

  // Log the results
  console.log(JSON.stringify(messages, null, 2));

  // Example output:
  // {
  //   "general": [
  //     {
  //       "date": "2025-11-18T10:30:00.000Z",
  //       "message": "Hello everyone!",
  //       "user": "John Doe"
  //     },
  //     {
  //       "date": "2025-11-18T14:22:15.000Z",
  //       "message": "How is everyone doing?",
  //       "user": "Jane Smith"
  //     }
  //   ],
  //   "announcements": [
  //     {
  //       "date": "2025-11-18T09:00:00.000Z",
  //       "message": "Welcome to the server!",
  //       "user": "Admin Bot"
  //     }
  //   ]
  // }

  return messages;
}

/**
 * Example 2: Fetch messages for yesterday
 */
export async function example2(env: Env, guildId: string) {
  console.log('Example 2: Fetching messages for yesterday');

  const messages = await getYesterdayChannelMessages(guildId, env);

  console.log(`Found messages in ${Object.keys(messages).length} channels`);

  // Count total messages
  const totalMessages = Object.values(messages).reduce(
    (sum, channelMessages) => sum + channelMessages.length,
    0
  );
  console.log(`Total messages: ${totalMessages}`);

  return messages;
}

/**
 * Example 3: Fetch messages using a date string
 */
export async function example3(env: Env, guildId: string) {
  console.log('Example 3: Fetching messages using date string');

  // Use a simple date string format (YYYY-MM-DD)
  const messages = await getChannelMessagesByDateString(guildId, '2025-11-18', env);

  return messages;
}

/**
 * Example 4: Process messages by channel
 */
export async function example4(env: Env, guildId: string) {
  console.log('Example 4: Processing messages by channel');

  const targetDate = new Date('2025-11-18');
  const allMessages = await getDailyChannelMessages(guildId, targetDate, env);

  // Iterate through each channel
  for (const [channelName, messages] of Object.entries(allMessages)) {
    console.log(`\n📢 Channel: #${channelName}`);
    console.log(`   Total messages: ${messages.length}`);

    // Show first 3 messages
    messages.slice(0, 3).forEach((msg, index) => {
      const date = new Date(msg.date).toLocaleTimeString();
      console.log(`   ${index + 1}. [${date}] ${msg.user}: ${msg.message.substring(0, 50)}...`);
    });
  }

  return allMessages;
}

/**
 * Example 5: Filter messages by specific user
 */
export async function example5(env: Env, guildId: string, userName: string) {
  console.log(`Example 5: Filtering messages by user "${userName}"`);

  const targetDate = new Date('2025-11-18');
  const allMessages = await getDailyChannelMessages(guildId, targetDate, env);

  // Filter messages by user across all channels
  const userMessages: DailyChannelMessages = {};

  for (const [channelName, messages] of Object.entries(allMessages)) {
    const filtered = messages.filter(msg => msg.user === userName);
    if (filtered.length > 0) {
      userMessages[channelName] = filtered;
    }
  }

  console.log(`Found ${Object.keys(userMessages).length} channels with messages from ${userName}`);

  return userMessages;
}

/**
 * Example 6: Generate daily report
 */
export async function example6(env: Env, guildId: string) {
  console.log('Example 6: Generating daily activity report');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const messages = await getDailyChannelMessages(guildId, yesterday, env);

  // Generate statistics
  const report = {
    date: yesterday.toISOString().split('T')[0],
    totalChannels: Object.keys(messages).length,
    totalMessages: 0,
    messagesByChannel: {} as Record<string, number>,
    activeUsers: new Set<string>(),
  };

  for (const [channelName, channelMessages] of Object.entries(messages)) {
    report.totalMessages += channelMessages.length;
    report.messagesByChannel[channelName] = channelMessages.length;

    // Track unique users
    channelMessages.forEach(msg => report.activeUsers.add(msg.user));
  }

  console.log('\n📊 Daily Activity Report');
  console.log(`Date: ${report.date}`);
  console.log(`Total Messages: ${report.totalMessages}`);
  console.log(`Active Channels: ${report.totalChannels}`);
  console.log(`Active Users: ${report.activeUsers.size}`);
  console.log('\nMessages per channel:');

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

/**
 * Example 7: Export messages to JSON file
 */
export async function example7(env: Env, guildId: string, outputPath: string) {
  console.log('Example 7: Exporting messages to JSON file');

  const targetDate = new Date('2025-11-18');
  const messages = await getDailyChannelMessages(guildId, targetDate, env);

  // In a Node.js environment, you would write to file:
  // import { writeFile } from 'fs/promises';
  // await writeFile(outputPath, JSON.stringify(messages, null, 2));

  // In Cloudflare Workers, you might store in R2 or KV
  console.log(`Would export to: ${outputPath}`);
  console.log(`Data size: ${JSON.stringify(messages).length} bytes`);

  return messages;
}

/**
 * Main function to run all examples
 */
export async function runExamples(env: Env, guildId: string) {
  try {
    console.log('='.repeat(60));
    console.log('Running Daily Messages Examples');
    console.log('='.repeat(60));

    // Run each example
    await example1(env, guildId);
    console.log('\n' + '-'.repeat(60) + '\n');

    await example2(env, guildId);
    console.log('\n' + '-'.repeat(60) + '\n');

    await example3(env, guildId);
    console.log('\n' + '-'.repeat(60) + '\n');

    await example4(env, guildId);
    console.log('\n' + '-'.repeat(60) + '\n');

    await example5(env, guildId, 'John Doe');
    console.log('\n' + '-'.repeat(60) + '\n');

    await example6(env, guildId);
    console.log('\n' + '-'.repeat(60) + '\n');

    await example7(env, guildId, './daily-messages.json');

    console.log('\n' + '='.repeat(60));
    console.log('Examples completed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error running examples:', error);
    throw error;
  }
}
