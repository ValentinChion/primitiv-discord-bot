/**
 * Type definitions for the Cloudflare Worker
 */

export interface Env {
  // Discord configuration
  DISCORD_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPLICATION_ID: string;
  TRESORIER_ID: string;

  // Database
  DATABASE_URL: string;

  // Google Drive
  GOOGLE_DRIVE_FOLDER_ID: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
}
