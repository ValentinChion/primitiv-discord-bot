import { Env } from "../types";

/**
 * Sends a message to a specific Discord channel
 *
 * @param channelId - The ID of the Discord channel to send the message to
 * @param content - The message content (text)
 * @param env - Environment variables containing DISCORD_TOKEN
 * @returns The created message object from Discord API
 *
 * @example
 * ```ts
 * await sendDiscordMessage(
 *   '1234567890123456789',
 *   'Hello from the bot!',
 *   env
 * );
 * ```
 */
export async function sendDiscordMessage(
  channelId: string,
  content: string,
  env: Env
): Promise<any> {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message to channel ${channelId}: ${error}`);
  }

  return await response.json();
}

/**
 * Sends an embed message to a specific Discord channel
 *
 * @param channelId - The ID of the Discord channel to send the message to
 * @param embed - The embed object to send
 * @param env - Environment variables containing DISCORD_TOKEN
 * @returns The created message object from Discord API
 *
 * @example
 * ```ts
 * await sendDiscordEmbed(
 *   '1234567890123456789',
 *   {
 *     title: 'Hello!',
 *     description: 'This is an embed message',
 *     color: 0x5865F2
 *   },
 *   env
 * );
 * ```
 */
export async function sendDiscordEmbed(
  channelId: string,
  embed: any,
  env: Env
): Promise<any> {
  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify({ embeds: [embed] }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send embed to channel ${channelId}: ${error}`);
  }

  return await response.json();
}
