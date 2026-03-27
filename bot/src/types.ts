/**
 * Type definitions for the Cloudflare Worker
 */

export interface Env {
  // Discord configuration
  DISCORD_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPLICATION_ID: string;
  TRESORIER_ID: string;
  GUILD_ID?: string; // Optional: Discord server ID for fetching channels/messages

  // Database
  DATABASE_URL: string;

  // R2 file storage
  FILES_BUCKET: R2Bucket;
  R2_PUBLIC_URL: string;

  // Claude API
  ANTHROPIC_API_KEY?: string; // Optional: For AI-powered features
}
