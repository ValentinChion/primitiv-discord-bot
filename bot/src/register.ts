/**
 * Script to register slash commands with Discord
 * Run this once with: npm run register
 *
 * Required environment variables:
 * - DISCORD_TOKEN
 * - DISCORD_APPLICATION_ID
 */

import { config } from 'dotenv';
import { ALL_COMMANDS } from './commands.js';

// Load environment variables from .dev.vars for local development
config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !applicationId) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_APPLICATION_ID environment variables');
}

/**
 * Register commands globally (available in all servers where bot is installed)
 * For faster testing, you can register commands for a specific guild:
 * const url = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`;
 */
const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

const response = await fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${token}`,
  },
  body: JSON.stringify(ALL_COMMANDS),
});

if (response.ok) {
  const data = await response.json();
  console.log('✅ Successfully registered commands:');
  console.log(JSON.stringify(data, null, 2));
} else {
  const errorText = await response.text();
  console.error('❌ Failed to register commands');
  console.error(`Status: ${response.status}`);
  console.error(errorText);
  process.exit(1);
}
