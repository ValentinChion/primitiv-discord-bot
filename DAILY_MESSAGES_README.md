# Daily Channel Messages Function

This documentation explains how to use the `getDailyChannelMessages` function to fetch all messages from all channels for a specific day.

## Overview

The function fetches all messages from all text channels in a Discord server for a given 24-hour period and returns them in a structured format.

## Location

- **Service File**: `bot/src/services/messages.ts`
- **Examples**: `bot/src/examples/fetch-daily-messages.ts`

## Output Format

```typescript
{
  "<channel_name>": [
    {
      date: "<ISO 8601 timestamp>",
      message: "<message content>",
      user: "<display name or username>"
    }
  ]
}
```

### Example Output

```json
{
  "general": [
    {
      "date": "2025-11-18T10:30:00.000Z",
      "message": "Hello everyone!",
      "user": "John Doe"
    },
    {
      "date": "2025-11-18T14:22:15.000Z",
      "message": "How is everyone doing?",
      "user": "Jane Smith"
    }
  ],
  "announcements": [
    {
      "date": "2025-11-18T09:00:00.000Z",
      "message": "Welcome to the server!",
      "user": "Admin Bot"
    }
  ]
}
```

## Usage

### Basic Usage

```typescript
import { getDailyChannelMessages } from './services/messages.js';
import type { Env } from './types.js';

// Fetch messages for November 18, 2025
const targetDate = new Date('2025-11-18');
const guildId = '1234567890'; // Your Discord server ID
const messages = await getDailyChannelMessages(guildId, targetDate, env);

console.log(JSON.stringify(messages, null, 2));
```

### Helper Functions

#### Get Yesterday's Messages

```typescript
import { getYesterdayChannelMessages } from './services/messages.js';

const messages = await getYesterdayChannelMessages(guildId, env);
```

#### Use Date String

```typescript
import { getChannelMessagesByDateString } from './services/messages.js';

// Use YYYY-MM-DD format
const messages = await getChannelMessagesByDateString(guildId, '2025-11-18', env);
```

## Function Parameters

### `getDailyChannelMessages(guildId, targetDate, env)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `guildId` | `string` | Discord server (guild) ID |
| `targetDate` | `Date` | The date to fetch messages for (UTC) |
| `env` | `Env` | Environment variables containing `DISCORD_TOKEN` |

**Returns:** `Promise<DailyChannelMessages>`

## Environment Setup

Add your Discord server ID to your environment variables (optional):

```bash
# In .env or wrangler.toml
GUILD_ID="your_discord_server_id"
```

Or pass it directly as a parameter to the function.

## Finding Your Guild ID

1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click on your server icon
3. Click "Copy Server ID"

## Features

- ✅ Fetches from all text channels and announcement channels
- ✅ Automatically handles pagination for channels with many messages
- ✅ Filters messages by date range (00:00:00 to 23:59:59 UTC)
- ✅ Respects channel permissions (skips channels bot can't access)
- ✅ Shows user display names (nickname → global name → username)
- ✅ Rate limiting protection (100ms delay between requests)
- ✅ Skips empty messages and channels with no messages

## Supported Channel Types

- Text Channels (type 0)
- Announcement Channels (type 5)

**Not supported:**
- Voice Channels
- Categories
- Forum Channels
- Stage Channels

## Error Handling

The function handles various error scenarios:

- **403 Forbidden**: Channel is skipped (bot lacks read permissions)
- **Invalid date**: Throws error for malformed date strings
- **Network errors**: Propagates error to caller

```typescript
try {
  const messages = await getDailyChannelMessages(guildId, date, env);
} catch (error) {
  console.error('Failed to fetch messages:', error);
}
```

## Performance Considerations

- Large servers with many channels may take several seconds to process
- Each channel requires at least one API request
- Channels with >100 messages on the target day require multiple requests
- Rate limiting adds 100ms delay between requests
- Consider running asynchronously or as a background job

## Integration Examples

### Example 1: Daily Report Command

```typescript
// Add to commands.ts
export const DAILY_REPORT_COMMAND = {
  name: 'daily-report',
  description: 'Generate a report of yesterday\'s messages',
  type: 1,
};

// Add handler
import { getYesterdayChannelMessages } from './services/messages.js';

export async function handleDailyReportCommand(interaction: any, env: Env) {
  const guildId = interaction.guild_id;

  // Defer response (this may take a while)
  await deferResponse(interaction);

  const messages = await getYesterdayChannelMessages(guildId, env);

  // Generate summary
  let totalMessages = 0;
  let report = '📊 **Yesterday\'s Activity Report**\\n\\n';

  for (const [channel, msgs] of Object.entries(messages)) {
    totalMessages += msgs.length;
    report += `#${channel}: ${msgs.length} messages\\n`;
  }

  report += `\\n**Total:** ${totalMessages} messages`;

  return updateResponse(interaction, report);
}
```

### Example 2: Scheduled Daily Export

```typescript
// In Cloudflare Worker with scheduled event
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const messages = await getDailyChannelMessages(
      env.GUILD_ID!,
      yesterday,
      env
    );

    // Store in R2, KV, or send via webhook
    await env.STORAGE.put(
      `messages-${yesterday.toISOString().split('T')[0]}.json`,
      JSON.stringify(messages)
    );
  }
};
```

### Example 3: Filter by Keyword

```typescript
import { getDailyChannelMessages } from './services/messages.js';

async function findMessagesWithKeyword(
  guildId: string,
  date: Date,
  keyword: string,
  env: Env
) {
  const allMessages = await getDailyChannelMessages(guildId, date, env);
  const filtered: DailyChannelMessages = {};

  for (const [channel, messages] of Object.entries(allMessages)) {
    const matching = messages.filter(msg =>
      msg.message.toLowerCase().includes(keyword.toLowerCase())
    );

    if (matching.length > 0) {
      filtered[channel] = matching;
    }
  }

  return filtered;
}
```

## Rate Limits

Discord API rate limits:

- **Per-channel message fetch**: 5 requests per 5 seconds
- **Global rate limit**: 50 requests per second
- The function includes 100ms delays to stay within limits
- For servers with many active channels, consider implementing additional throttling

## TypeScript Types

```typescript
interface DailyMessage {
  date: string;           // ISO 8601 timestamp
  message: string;        // Message content
  user: string;          // Display name or username
}

interface DailyChannelMessages {
  [channelName: string]: DailyMessage[];
}
```

## Troubleshooting

### No messages returned

- Verify bot has "Read Message History" permission
- Check if bot has access to the channels
- Ensure date is correct (uses UTC timezone)
- Verify DISCORD_TOKEN is valid

### Missing some channels

- Bot may lack permission for private channels
- Check channel type (only text and announcement channels are fetched)

### Slow performance

- Large servers require more API calls
- Consider caching results
- Run as background job
- Implement pagination for large datasets

## Additional Resources

- See `bot/src/examples/fetch-daily-messages.ts` for 7 detailed examples
- Discord API Documentation: https://discord.com/developers/docs
- Bot Permissions: https://discord.com/developers/docs/topics/permissions

## License

This code is part of the Primitiv Discord Bot project.
