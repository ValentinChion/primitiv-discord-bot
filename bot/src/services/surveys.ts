/**
 * Service for retrieving Discord surveys (polls)
 * Provides functionality to fetch ongoing and recently closed polls from channels
 */

import chalk from "chalk";
import type { Env } from "../types.js";

/**
 * Discord API poll answer structure
 */
interface PollAnswer {
  answer_id: number;
  poll_media: {
    text?: string;
    emoji?: {
      id?: string;
      name?: string;
    };
  };
}

/**
 * Discord API poll results structure
 */
interface PollResults {
  is_finalized: boolean;
  answer_counts: Array<{
    id: number;
    count: number;
    me_voted: boolean;
  }>;
}

/**
 * Discord API poll structure
 */
export interface DiscordPoll {
  question: {
    text: string;
  };
  answers: PollAnswer[];
  expiry: string | null; // ISO 8601 timestamp
  allow_multiselect: boolean;
  layout_type: number;
  results?: PollResults;
}

/**
 * Discord API message with poll
 */
interface DiscordMessageWithPoll {
  id: string;
  channel_id: string;
  author: {
    id: string;
    username: string;
    global_name?: string;
  };
  content: string;
  timestamp: string;
  poll?: DiscordPoll;
}

/**
 * Formatted survey information for reporting
 */
export interface SurveyInformation {
  question: string;
  answers: Array<{
    id: number;
    text: string;
    emoji?: string;
    voteCount: number;
  }>;
  isClosed: boolean;
  closingDate: string | null; // ISO 8601 timestamp
  allowMultiselect: boolean;
  totalVotes: number;
  createdAt: string;
  messageId: string;
  author: string;
}

/**
 * Fetches messages with polls from a channel within a date range
 */
async function fetchChannelPolls(
  channelId: string,
  token: string,
  startDate: Date,
  endDate: Date
): Promise<DiscordMessageWithPoll[]> {
  const pollMessages: DiscordMessageWithPoll[] = [];
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
      // If we get a 403, the bot doesn't have permission
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

    const batch = (await response.json()) as DiscordMessageWithPoll[];

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    // Filter messages with polls within the date range
    for (const message of batch) {
      const messageDate = new Date(message.timestamp);

      // If message is older than our range, stop fetching
      if (messageDate < startDate) {
        hasMore = false;
        break;
      }

      // If message is within range and has a poll, add it
      if (messageDate >= startDate && messageDate < endDate && message.poll) {
        pollMessages.push(message);
      }
    }

    // Set pagination cursor
    lastMessageId = batch[batch.length - 1].id;

    // Discord rate limiting: wait between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return pollMessages;
}

/**
 * Formats a Discord poll message into SurveyInformation
 */
export function formatPollMessage(
  message: DiscordMessageWithPoll
): SurveyInformation | null {
  if (!message.poll) {
    return null;
  }

  const poll = message.poll;
  const results = poll.results;
  const isClosed = results?.is_finalized ?? false;

  // Calculate total votes
  let totalVotes = 0;
  if (results?.answer_counts) {
    totalVotes = results.answer_counts.reduce(
      (sum, answer) => sum + answer.count,
      0
    );
  }

  // Format answers with vote counts
  const answers = poll.answers.map((answer) => {
    const voteCount =
      results?.answer_counts.find((ac) => ac.id === answer.answer_id)?.count ??
      0;

    return {
      id: answer.answer_id,
      text: answer.poll_media.text ?? "",
      emoji: answer.poll_media.emoji?.name,
      voteCount,
    };
  });

  // Get author name (prefer global_name over username)
  const author = message.author.global_name ?? message.author.username;

  return {
    question: poll.question.text,
    answers,
    isClosed,
    closingDate: poll.expiry,
    allowMultiselect: poll.allow_multiselect,
    totalVotes,
    createdAt: message.timestamp,
    messageId: message.id,
    author,
  };
}

/**
 * Retrieves survey information for a channel
 * Includes ongoing surveys and surveys closed within the specified hours
 *
 * @param channelId - Discord channel ID
 * @param token - Discord bot token
 * @param hoursAgo - How many hours back to check for closed surveys (default: 24)
 * @returns Survey information or null if no relevant surveys found
 */
export async function getChannelSurvey(
  channelId: string,
  token: string,
  hoursAgo: number = 24
): Promise<SurveyInformation | null> {
  const now = new Date();
  const startDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  const endDate = now;

  try {
    // Fetch all messages with polls from the specified time range
    const pollMessages = await fetchChannelPolls(
      channelId,
      token,
      startDate,
      endDate
    );

    if (pollMessages.length === 0) {
      return null;
    }

    // Process each poll and find relevant ones
    const surveys: SurveyInformation[] = [];

    for (const message of pollMessages) {
      const survey = formatPollMessage(message);
      if (!survey) {
        continue;
      }

      // Include if:
      // 1. Survey is ongoing (not closed)
      // 2. Survey was closed within the specified time period
      if (!survey.isClosed) {
        surveys.push(survey);
      } else if (survey.closingDate) {
        const closingDate = new Date(survey.closingDate);
        if (closingDate >= startDate) {
          surveys.push(survey);
        }
      }
    }

    // Return the most recent relevant survey
    // Prioritize ongoing surveys over closed ones
    const ongoingSurvey = surveys.find((s) => !s.isClosed);
    if (ongoingSurvey) {
      return ongoingSurvey;
    }

    // Return most recently closed survey
    if (surveys.length > 0) {
      return surveys[0];
    }

    return null;
  } catch (error) {
    console.log(
      chalk.red(`❌ Error fetching surveys from channel ${channelId}:`),
      error
    );
    return null;
  }
}

/**
 * Retrieves all ongoing surveys across all channels in a guild
 *
 * @param guildId - Discord guild (server) ID
 * @param token - Discord bot token
 * @returns Array of survey information with channel names
 */
export async function getOngoingSurveys(
  guildId: string,
  env: Env
): Promise<Array<SurveyInformation & { channelName: string }>> {
  console.log(chalk.cyan("\n🔍 Fetching ongoing surveys..."));

  const channels = await fetchGuildChannels(guildId, env.DISCORD_TOKEN);
  const surveys: Array<SurveyInformation & { channelName: string }> = [];

  for (const channel of channels) {
    const survey = await getChannelSurvey(
      channel.id,
      env.DISCORD_TOKEN,
      24 * 365 // Look back far enough to catch any ongoing survey
    );

    if (survey && !survey.isClosed) {
      surveys.push({
        ...survey,
        channelName: channel.name,
      });
    }
  }

  console.log(
    chalk.green(`✓ Found ${chalk.bold(surveys.length)} ongoing surveys`)
  );
  return surveys;
}

/**
 * Retrieves recently closed surveys across all channels in a guild
 *
 * @param guildId - Discord guild (server) ID
 * @param env - Environment variables
 * @param hoursAgo - How many hours back to check (default: 24)
 * @returns Array of survey information with channel names
 */
export async function getRecentlyClosedSurveys(
  guildId: string,
  env: Env,
  hoursAgo: number = 24
): Promise<Array<SurveyInformation & { channelName: string }>> {
  console.log(
    chalk.cyan(`\n🔍 Fetching surveys closed in the last ${hoursAgo} hours...`)
  );

  const channels = await fetchGuildChannels(guildId, env.DISCORD_TOKEN);
  const surveys: Array<SurveyInformation & { channelName: string }> = [];

  for (const channel of channels) {
    const survey = await getChannelSurvey(
      channel.id,
      env.DISCORD_TOKEN,
      hoursAgo
    );

    if (survey && survey.isClosed && survey.closingDate) {
      const closingDate = new Date(survey.closingDate);
      const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      if (closingDate >= cutoffDate) {
        surveys.push({
          ...survey,
          channelName: channel.name,
        });
      }
    }
  }

  console.log(
    chalk.green(`✓ Found ${chalk.bold(surveys.length)} recently closed surveys`)
  );
  return surveys;
}

/**
 * Helper type for fetchGuildChannels
 */
interface DiscordChannel {
  id: string;
  parent_id?: string;
  name: string;
  type: number;
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
  return channels.filter((channel) => channel.type === 0 || channel.type === 5);
}
