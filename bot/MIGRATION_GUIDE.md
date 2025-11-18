# Migration Guide: Discord.js Bot → Cloudflare Workers

This document explains the key differences between the original Discord.js bot and the Cloudflare Workers version.

## Architecture Comparison

### Original Bot (Discord.js)
```
┌─────────────────┐
│  Discord.js Bot │ ← WebSocket connection to Discord
├─────────────────┤
│ Message Events  │ ← Listens for !commands
│ Event Handlers  │
├─────────────────┤
│    Prisma       │ ← Direct DB connection
│   PostgreSQL    │
└─────────────────┘
     Long-running process
     Requires server/VPS
     Maintains persistent connection
```

### Cloudflare Workers Version
```
┌─────────────────────┐
│   Discord API       │ ← Sends HTTP POST requests
├─────────────────────┤
│ Cloudflare Worker   │ ← Serverless function
│  (HTTP endpoint)    │
├─────────────────────┤
│ Prisma Accelerate   │ ← Connection pooling
│    PostgreSQL       │
└─────────────────────┘
     Serverless, stateless
     No infrastructure needed
     Responds to HTTP requests
```

## Key Differences

### 1. Command System

**Before (Message Commands)**
```typescript
// Listen for message events
client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!demande')) {
    // Parse command manually
    const args = message.content.split(' ');
    const name = args[1];
    const amount = parseFloat(args[2]);
    // ...
  }
});
```

**After (Slash Commands)**
```typescript
// Discord sends structured HTTP POST with parsed options
{
  type: InteractionType.APPLICATION_COMMAND,
  data: {
    name: 'demande',
    options: [
      { name: 'nom', value: 'achat_stylos' },
      { name: 'montant', value: 15.99 },
      // ...
    ]
  }
}
```

**Benefits:**
- Auto-completion in Discord UI
- Type validation built-in
- No manual parsing needed
- Better UX with dropdown menus and options

### 2. Request Verification

**Before:**
- Discord.js handles authentication automatically
- WebSocket connection is secure by default

**After:**
- Must verify each HTTP request manually
- Uses cryptographic signature verification

```typescript
import { verifyKey } from 'discord-interactions';

const isValid = verifyKey(
  body,
  signature,
  timestamp,
  publicKey
);
```

### 3. Database Connection

**Before: Direct Connection**
```typescript
const prisma = new PrismaClient();
// Works fine for long-running processes
```

**After: Connection Pooling Required**
```typescript
const prisma = new PrismaClient({
  datasourceUrl: accelerateUrl,
}).$extends(withAccelerate());
// Required for serverless environments
```

**Why?**
- Cloudflare Workers have execution time limits
- Cannot maintain persistent DB connections
- Prisma Accelerate provides connection pooling

### 4. File Handling

**Before:**
```typescript
// Direct access to message attachments
const attachment = message.attachments.first();
const response = await fetch(attachment.url);
```

**After:**
```typescript
// Files come in interaction payload
const attachmentId = options.find(o => o.name === 'facture').value;
const attachment = resolved.attachments[attachmentId];
const buffer = await downloadFromDiscord(attachment.url);
```

### 5. Response Pattern

**Before:**
```typescript
// Can respond at any time
await message.reply('Request created!');
// Later...
await message.channel.send('Additional info...');
```

**After:**
```typescript
// Must respond within 3 seconds
return new Response(JSON.stringify({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: { content: 'Request created!' }
}));

// For follow-up messages, use webhooks
await fetch(`https://discord.com/api/v10/webhooks/...`);
```

### 6. Deployment

**Before:**
```bash
# Run on a server
pnpm start

# Keep it running (use PM2, systemd, etc.)
pm2 start main.ts
```

**After:**
```bash
# Deploy to Cloudflare
pnpm deploy

# Automatically scaled, no server management
```

## Feature Parity Checklist

| Feature | Original | Workers | Notes |
|---------|----------|---------|-------|
| Create requests | ✅ | ✅ | Now with slash commands |
| Treasurer approval | ✅ | ✅ | Button interactions work the same |
| Payment confirmation | ✅ | ✅ | With file upload |
| Reimbursement requests | ✅ | ✅ | With file upload |
| Google Drive upload | ✅ | ✅ | Same functionality |
| Database persistence | ✅ | ✅ | Via Accelerate |
| DM notifications | ✅ | ✅ | Using Discord API |
| Channel restrictions | ✅ | ❌ | Can add if needed |

## Advantages of Workers Version

1. **Cost**: $0/month vs VPS costs
2. **Scalability**: Auto-scales with usage
3. **Reliability**: Global CDN distribution
4. **Maintenance**: No server management
5. **Performance**: Low latency worldwide
6. **DX**: Better command validation with slash commands

## Limitations

1. **Execution time**: Max 30s CPU time (usually enough)
2. **No WebSocket**: Can't listen to all messages (only interactions)
3. **Stateless**: Can't maintain in-memory state between requests
4. **Database**: Requires connection pooling (Prisma Accelerate)

## When to Use Which?

### Use Original Discord.js Bot When:
- Need to react to all messages, not just commands
- Require complex stateful operations
- Need real-time presence/voice channel features
- Want full control over infrastructure

### Use Cloudflare Workers When:
- Only need slash commands and interactions
- Want zero-cost, zero-maintenance deployment
- Need global distribution and auto-scaling
- Prefer serverless architecture

## Migration Steps

If you want to migrate an existing bot:

1. ✅ Register slash commands to replace message commands
2. ✅ Set up Prisma Accelerate for database access
3. ✅ Implement signature verification
4. ✅ Adapt handlers to HTTP request/response pattern
5. ✅ Deploy to Cloudflare Workers
6. ✅ Update Discord Interactions URL
7. ✅ Test all commands
8. ✅ Decommission old bot (optional)

## Rollback Plan

Keep the original bot code! You can always switch back:

1. Start the original bot
2. Remove Interactions URL from Discord settings
3. Bot will use Gateway API again

Both versions can coexist during testing.
