/**
 * Service for fetching Discord messages
 * Provides functionality to retrieve all messages from all channels for a specific day
 */

import chalk from "chalk";
import type { Env } from "../types.js";
import {
  DiscordPoll,
  formatPollMessage,
  SurveyInformation,
} from "./surveys.js";

const CATEGORIES_EXCLUDE = [
  "994894044570329099",
  "880137433650429984",
  "994891192208728074",
  "1150163593778696383",
  "1167411805660921977",
];

/**
 * Represents a Discord message with user information
 */
export interface DailyMessage {
  date: string;
  message: string;
  user: string;
}

/**
 * Channel information with messages
 */
export interface ChannelMessages {
  id: string;
  name: string;
  messages: DailyMessage[];
}

/**
 * Output format: channel name mapped to channel info and messages
 */
export interface DailyChannelMessages {
  [channelName: string]: ChannelMessages;
}

/**
 * Discord API channel type
 */
interface DiscordChannel {
  id: string;
  parent_id?: string;
  name: string;
  type: number;
}

/**
 * Discord API message type
 */
interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  author: {
    id: string;
    username: string;
    global_name?: string;
  };
  poll?: DiscordPoll;
  survey?: SurveyInformation;
}

/**
 * Discord API user type
 */
interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

/**
 * Discord API guild member type
 */
interface DiscordGuildMember {
  user: DiscordUser;
  nick?: string;
}

/**
 * Fetches all text channels from a guild
 */
async function fetchGuildChannels(
  guildId: string,
  token: string
): Promise<DiscordChannel[]> {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/channels`,
    {
      headers: {
        Authorization: `Bot ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch channels: ${response.status} ${response.statusText}`
    );
  }

  const channels = (await response.json()) as DiscordChannel[];

  // Filter for text channels (type 0) and announcement channels (type 5)
  // Excludes voice channels (type 2), categories (type 4), etc.
  return channels.filter((channel) => channel.type === 0 || channel.type === 5);
}

/**
 * Fetches messages from a channel for a specific date range
 * Discord API returns messages in reverse chronological order (newest first)
 */
async function fetchChannelMessages(
  channelId: string,
  token: string,
  startDate: Date,
  endDate: Date
): Promise<DiscordMessage[]> {
  const messages: DiscordMessage[] = [];
  let lastMessageId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    // Build URL with pagination
    let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`;
    if (lastMessageId) {
      url += `&before=${lastMessageId}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });

    if (!response.ok) {
      // If we get a 403, the bot likely doesn't have permission to read this channel
      if (response.status === 403) {
        console.log(
          chalk.yellow(`⚠️  No permission to read channel ${channelId}`)
        );
        break;
      }
      throw new Error(
        `Failed to fetch messages: ${response.status} ${response.statusText}`
      );
    }

    const batch = (await response.json()) as DiscordMessage[];

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    // Filter messages within the date range
    for (const message of batch) {
      const messageDate = new Date(message.timestamp);

      // If message is older than our range, stop fetching
      if (messageDate < startDate) {
        hasMore = false;
        break;
      }

      // If message is within our range, add it
      if (messageDate >= startDate && messageDate < endDate) {
        if (message?.poll) {
          const survey = formatPollMessage(message);
          message.poll = undefined;
          message.survey = survey;
        }
        messages.push(message);
      }
    }

    // Set pagination cursor
    lastMessageId = batch[batch.length - 1].id;

    // Discord rate limiting: wait a bit between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return messages;
}

/**
 * Fetches guild member information to get display name
 */
async function fetchGuildMember(
  guildId: string,
  userId: string,
  token: string
): Promise<DiscordGuildMember | null> {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DiscordGuildMember;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to fetch member ${userId}:`), error);
    return null;
  }
}

/**
 * Fetches all guild members in bulk to avoid individual API calls
 * Uses pagination to handle guilds with more than 1000 members
 */
async function fetchAllGuildMembers(
  guildId: string,
  token: string
): Promise<Map<string, DiscordGuildMember>> {
  const memberCache = new Map<string, DiscordGuildMember>();
  let lastUserId: string | undefined;
  let hasMore = true;

  console.log(chalk.cyan(`📋 Fetching guild members in bulk...`));

  while (hasMore) {
    // Build URL with pagination
    let url = `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`;
    if (lastUserId) {
      url += `&after=${lastUserId}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bot ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch guild members: ${response.status} ${response.statusText}`
        );
      }

      const batch = (await response.json()) as DiscordGuildMember[];

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      // Add members to cache
      for (const member of batch) {
        memberCache.set(member.user.id, member);
      }

      // If we got less than 1000, we've reached the end
      if (batch.length < 1000) {
        hasMore = false;
      } else {
        // Set pagination cursor to the last user ID
        lastUserId = batch[batch.length - 1].user.id;
      }

      // Discord rate limiting: wait a bit between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(chalk.red(`❌ Failed to fetch guild members:`), error);
      hasMore = false;
    }
  }

  console.log(
    chalk.green(`✓ Cached ${chalk.bold(memberCache.size)} guild members`)
  );

  return memberCache;
}

/**
 * Formats user display name (firstname lastname or username)
 * If memberCache is provided, uses cached data instead of making API calls
 */
async function formatUserName(
  guildId: string,
  author: DiscordMessage["author"],
  token: string,
  memberCache?: Map<string, DiscordGuildMember>
): Promise<string> {
  let member: DiscordGuildMember | null = null;

  // Use cache if available, otherwise fetch individually
  if (memberCache) {
    member = memberCache.get(author.id) || null;
  } else {
    member = await fetchGuildMember(guildId, author.id, token);
  }

  // Priority: nickname > global_name > username
  if (member?.nick) {
    return member.nick;
  }

  if (author.global_name) {
    return author.global_name;
  }

  return author.username;
}

/**
 * Main function: Fetches all messages from all channels for a specific day
 *
 * @param guildId - Discord guild (server) ID
 * @param targetDate - The date to fetch messages for (e.g., new Date('2025-11-18'))
 * @param env - Environment variables containing DISCORD_TOKEN
 * @returns Object with channel names as keys and arrays of messages as values
 *
 * @example
 * // Fetch all messages for November 18, 2025
 * const messages = await getDailyChannelMessages(
 *   '1234567890',
 *   new Date('2025-11-18'),
 *   env
 * );
 *
 * // Output format:
 * // {
 * //   "general": [
 * //     {
 * //       date: "2025-11-18T10:30:00.000Z",
 * //       message: "Hello everyone!",
 * //       user: "John Doe"
 * //     }
 * //   ]
 * // }
 */
export async function getDailyChannelMessages(
  targetDate: Date,
  env: Env
): Promise<DailyChannelMessages> {
  const result: DailyChannelMessages = {};

  // Calculate date range (start of day to start of next day in UTC)
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  endOfDay.setTime(endOfDay.getTime() + 1); // Add 1ms to get to start of next day

  console.log(
    chalk.cyan(
      `\n🔍 Fetching messages for ${chalk.bold(
        startOfDay.toISOString()
      )} to ${chalk.bold(endOfDay.toISOString())}`
    )
  );

  // Step 1: Fetch all text channels
  const channels = await fetchGuildChannels(env.GUILD_ID!, env.DISCORD_TOKEN);
  console.log(
    chalk.green(`✓ Found ${chalk.bold(channels.length)} text channels`)
  );

  // Step 2: Fetch all guild members in bulk (optimization to reduce API calls)
  const memberCache = await fetchAllGuildMembers(
    env.GUILD_ID!,
    env.DISCORD_TOKEN
  );

  // Step 3: Fetch messages from each channel
  for (const channel of channels) {
    if (
      channel.parent_id &&
      CATEGORIES_EXCLUDE.includes(channel.parent_id) &&
      channel.id !== "1167411939266265098"
    ) {
      console.log(
        chalk.gray(`ℹ️ Skipping #${channel.name} (excluded category)`)
      );
      continue;
    }

    console.log(
      chalk.blue(
        `  📥 Fetching messages from ${chalk.bold("#" + channel.name)}...`
      )
    );

    try {
      const messages = await fetchChannelMessages(
        channel.id,
        env.DISCORD_TOKEN,
        startOfDay,
        endOfDay
      );

      if (messages.length === 0) {
        console.log(
          chalk.gray(`     ℹ️  No messages found in #${channel.name}`)
        );
        continue;
      }

      console.log(
        chalk.green(
          `     ✓ Found ${chalk.bold(messages.length)} messages in ${chalk.bold(
            "#" + channel.name
          )}`
        )
      );

      // Step 4: Format messages
      const formattedMessages: DailyMessage[] = [];

      for (const message of messages) {
        // Skip empty messages
        if (!message.content || message.content.trim() === "") {
          continue;
        }

        const userName = await formatUserName(
          env.GUILD_ID!,
          message.author,
          env.DISCORD_TOKEN,
          memberCache
        );

        formattedMessages.push({
          date: message.timestamp,
          message: message.content,
          user: userName,
        });
      }

      // Only add channel to result if it has messages
      if (formattedMessages.length > 0) {
        result[channel.name] = {
          id: channel.id,
          name: channel.name,
          messages: formattedMessages,
        };
      }
    } catch (error) {
      console.log(
        chalk.red(`     ❌ Error fetching messages from #${channel.name}:`),
        error
      );
      // Continue with other channels even if one fails
    }
  }

  return result;
}

/**
 * Helper function to get messages for "yesterday"
 */
export async function getYesterdayChannelMessages(
  guildId: string,
  env: Env
): Promise<DailyChannelMessages> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDailyChannelMessages(guildId, yesterday, env);
}

/**
 * Helper function to get messages for a specific date string (YYYY-MM-DD)
 */
export async function getChannelMessagesByDateString(
  guildId: string,
  dateString: string,
  env: Env
): Promise<DailyChannelMessages> {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(
      `Invalid date string: ${dateString}. Expected format: YYYY-MM-DD`
    );
  }
  return getDailyChannelMessages(guildId, date, env);
}
