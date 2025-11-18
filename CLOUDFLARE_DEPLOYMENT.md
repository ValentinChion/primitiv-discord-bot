# 🚀 Deploying Discord Bot to Cloudflare Workers (Free!)

This guide will help you deploy your Primitiv Discord bot to Cloudflare Workers at zero cost.

## 📁 What Changed?

A new `worker/` directory has been created with a serverless version of the bot:

```
primitiv-discord-bot/
├── bot/                    # Original Discord.js bot (still works!)
└── worker/                 # ⭐ NEW: Cloudflare Workers version
    ├── src/
    │   ├── index.ts       # Main worker entry point
    │   ├── commands.ts    # Slash command definitions
    │   ├── register.ts    # Command registration script
    │   ├── handlers/      # Command handlers
    │   └── services/      # Database & Google Drive
    ├── wrangler.toml      # Cloudflare configuration
    ├── package.json
    └── README.md          # Detailed setup guide
```

## 🔑 Key Differences

| Feature | Original Bot | Workers Version |
|---------|--------------|-----------------|
| Commands | `!demande` (messages) | `/demande` (slash commands) |
| Hosting | Requires VPS/server | Serverless (free!) |
| Connection | WebSocket | HTTP (Interactions API) |
| Database | Direct PostgreSQL | Prisma Accelerate |
| Cost | $5-20/month | $0/month ✨ |

## ⚡ Quick Start (5 minutes)

### 1. Prerequisites Checklist

- [ ] Discord bot created (get token from [Discord Portal](https://discord.com/developers/applications))
- [ ] PostgreSQL database (free tier: [Railway](https://railway.app), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
- [ ] Prisma Accelerate account (free at [prisma.io](https://www.prisma.io/data-platform/accelerate))
- [ ] Google Service Account with Drive API (see worker/README.md)
- [ ] Cloudflare account (free at [cloudflare.com](https://cloudflare.com))

### 2. Install Dependencies

```bash
cd worker
npm install  # or: pnpm install
```

### 3. Set Up Environment Variables

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your credentials. See `worker/README.md` for detailed instructions.

### 4. Register Slash Commands

```bash
npm run register
```

You should see: `✅ Successfully registered commands`

### 5. Deploy to Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Set secrets (do this once)
npx wrangler secret put DISCORD_TOKEN
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put TRESORIER_ID
npx wrangler secret put DATABASE_URL
npx wrangler secret put GOOGLE_DRIVE_FOLDER_ID
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put GOOGLE_PRIVATE_KEY

# Deploy!
npm run deploy
```

### 6. Configure Discord

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **General Information**
4. Set **Interactions Endpoint URL** to your worker URL:
   ```
   https://primitiv-discord-bot.your-subdomain.workers.dev
   ```
5. Save changes (Discord will verify the endpoint)

### 7. Invite Bot to Server

Generate invite URL:
1. Go to **OAuth2 > URL Generator**
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: Send Messages, Embed Links, Attach Files, Use Slash Commands
4. Open the generated URL to invite the bot

### 8. Test It!

In your Discord server, type `/` and you should see:
- `/demande` - Create a new request
- `/confirme` - Confirm payment
- `/remboursement` - Request reimbursement

## 📚 Full Documentation

For complete setup instructions, troubleshooting, and advanced configuration:
- **[worker/README.md](worker/README.md)** - Complete deployment guide
- **[worker/MIGRATION_GUIDE.md](worker/MIGRATION_GUIDE.md)** - Technical comparison with original bot

## ❓ FAQ

### Do I need to shut down the original bot?

No! Both versions can coexist. The original bot will continue to work with message commands (`!demande`), while the Workers version uses slash commands (`/demande`).

### What if I want to switch back?

Keep both! The original bot code is untouched in the `bot/` directory. To switch:
1. Start the original bot
2. Remove the Interactions URL from Discord settings
3. The bot will use the Gateway API (WebSocket) again

### How much does this cost?

**$0/month** with free tiers:
- Cloudflare Workers: 100,000 requests/day free
- Prisma Accelerate: Free tier available
- PostgreSQL: Free tier on Railway, Supabase, or Neon
- Google Drive API: Free

### Can I still use the message commands?

The Workers version uses slash commands only. Message commands (`!demande`) require the original bot running with WebSocket connection.

### What about my database?

Both versions use the same database schema. You can:
1. Use the same database for both (recommended during testing)
2. Or migrate data when ready to switch completely

### Is Prisma Accelerate required?

Yes, for Cloudflare Workers. Traditional database connections don't work in serverless environments due to connection limits. Prisma Accelerate provides connection pooling.

## 🆘 Troubleshooting

### Commands not showing up
- Wait up to 1 hour for global commands to propagate
- Or register guild-specific commands for instant testing (see worker/README.md)

### "Invalid request signature" error
- Verify `DISCORD_PUBLIC_KEY` is correct in your secrets
- Check the Interactions URL in Discord settings

### Database errors
- Ensure you're using Prisma Accelerate URL (starts with `prisma://`)
- Not the direct PostgreSQL URL

### Deploy fails
- Run `npx wrangler login` first
- Verify all secrets are set with `wrangler secret put`

## 🎯 Next Steps

1. ✅ Deploy the bot following the quick start above
2. ✅ Test all commands in your Discord server
3. ✅ Monitor usage in Cloudflare dashboard
4. ✅ Optionally decommission the original bot once satisfied

## 🔗 Useful Links

- [Cloudflare Workers Dashboard](https://dash.cloudflare.com)
- [Prisma Accelerate Console](https://console.prisma.io)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Need help?** Check the detailed guides in the `worker/` directory or create an issue!
