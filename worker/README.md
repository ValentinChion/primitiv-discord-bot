# Primitiv Discord Bot - Cloudflare Workers Deployment

This is a serverless Discord bot for managing financial requests, deployed on Cloudflare Workers (free tier). It's converted from the original Discord.js bot to use Discord's Interactions API.

## 🎯 Features

- ✅ **Slash commands** instead of message commands
- ✅ **Serverless deployment** on Cloudflare Workers (free!)
- ✅ **Database persistence** via Prisma with Accelerate
- ✅ **File uploads** to Google Drive
- ✅ **Button interactions** for approvals
- ✅ **DM notifications** to users and treasurer

## 📋 Prerequisites

1. **Node.js** v18 or higher
2. **pnpm** (recommended) or npm
3. **Cloudflare account** (free tier is sufficient)
4. **Discord Bot** with application ID and token
5. **PostgreSQL database** (can use free tier from Railway, Supabase, or Neon)
6. **Prisma Accelerate** account (free tier available)
7. **Google Service Account** with Drive API access

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd worker
pnpm install
```

### 2. Configure Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to **Bot** section and create a bot
4. Copy the **Bot Token**
5. Go to **General Information** and copy:
   - **Application ID**
   - **Public Key**
6. In **Bot** section, enable these intents:
   - Server Members Intent
   - Message Content Intent (if needed)

### 3. Configure Prisma Accelerate

Cloudflare Workers don't support traditional database connections due to connection pooling limitations. You **must** use Prisma Accelerate:

1. Go to [Prisma Data Platform](https://www.prisma.io/data-platform/accelerate)
2. Sign up for free account
3. Create a new project
4. Add your PostgreSQL database connection string
5. Copy the **Accelerate connection string** (format: `prisma://accelerate.prisma-data.net/?api_key=...`)

### 4. Set Up Google Drive

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google Drive API**
4. Create a **Service Account**:
   - Go to IAM & Admin > Service Accounts
   - Create service account
   - Create and download JSON key
5. Share your Google Drive folder with the service account email
6. Copy the **Folder ID** from the folder URL

### 5. Configure Environment Variables

For local development, create `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your credentials:

```bash
DISCORD_TOKEN=YOUR_BOT_TOKEN
DISCORD_PUBLIC_KEY=YOUR_PUBLIC_KEY
DISCORD_APPLICATION_ID=YOUR_APP_ID
TRESORIER_ID=DISCORD_USER_ID_OF_TREASURER

DATABASE_URL=prisma://accelerate.prisma-data.net/?api_key=YOUR_ACCELERATE_KEY

GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important:** For `GOOGLE_PRIVATE_KEY`, replace actual newlines with `\n` escape sequences.

### 6. Generate Prisma Client

```bash
pnpm prisma:generate
```

### 7. Register Slash Commands

Register your slash commands with Discord (do this once):

```bash
pnpm register
```

You should see output confirming the commands were registered.

### 8. Test Locally

Start the local development server:

```bash
pnpm dev
```

In another terminal, use a tool like `ngrok` to expose your local server:

```bash
ngrok http 8787
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and:

1. Go to Discord Developer Portal
2. Navigate to your application
3. Go to **General Information**
4. Set **Interactions Endpoint URL** to `https://abc123.ngrok.io`
5. Click **Save Changes**

Discord will send a PING request to verify the endpoint.

### 9. Deploy to Cloudflare Workers

First, login to Cloudflare:

```bash
npx wrangler login
```

Set production secrets (do this once):

```bash
npx wrangler secret put DISCORD_TOKEN
npx wrangler secret put DISCORD_PUBLIC_KEY
npx wrangler secret put DISCORD_APPLICATION_ID
npx wrangler secret put TRESORIER_ID
npx wrangler secret put DATABASE_URL
npx wrangler secret put GOOGLE_DRIVE_FOLDER_ID
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put GOOGLE_PRIVATE_KEY
```

Deploy the worker:

```bash
pnpm deploy
```

After deployment, you'll receive a URL like `https://primitiv-discord-bot.your-subdomain.workers.dev`

### 10. Update Discord Interactions URL

1. Go back to Discord Developer Portal
2. Update **Interactions Endpoint URL** to your Cloudflare Workers URL:
   ```
   https://primitiv-discord-bot.your-subdomain.workers.dev
   ```
3. Save changes

### 11. Invite Bot to Server

Generate an invite URL with proper permissions:

1. Go to **OAuth2 > URL Generator**
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Send Messages in Threads
   - Embed Links
   - Attach Files
   - Use Slash Commands
4. Copy the generated URL and open it to invite the bot

## 📝 Available Commands

### `/demande`
Create a new financial request
- **nom**: Unique name for the request (e.g., "achat_stylos")
- **montant**: Amount in euros
- **description**: Description of the expense

### `/confirme`
Confirm a payment made with the association's card
- **nom**: Name of the approved request
- **montant**: Payment amount
- **facture**: PDF invoice file

### `/remboursement`
Request reimbursement for a personal card payment
- **nom**: Name of the approved request
- **montant**: Reimbursement amount
- **facture**: PDF invoice file

## 🔄 Workflow

1. User creates a request with `/demande`
2. Treasurer receives DM with Accept/Deny buttons
3. If accepted:
   - User can pay with association card → `/confirme`
   - OR pay with personal card and request reimbursement → `/remboursement`
4. All invoices are automatically uploaded to Google Drive
5. Database tracks all requests and their status

## 💰 Cost Breakdown

- **Cloudflare Workers**: Free tier (100,000 requests/day)
- **Prisma Accelerate**: Free tier (generous limits)
- **PostgreSQL**: Free tier available on Railway, Supabase, Neon
- **Google Drive API**: Free

**Total monthly cost: $0** ✨

## 🐛 Troubleshooting

### Commands not showing up
1. Make sure you ran `pnpm register`
2. Wait up to 1 hour for global commands to propagate
3. For faster testing, register guild-specific commands (modify `register.ts`)

### "Invalid request signature" error
1. Verify `DISCORD_PUBLIC_KEY` is correct
2. Check that the Interactions URL is set correctly in Discord

### Database connection errors
1. Ensure you're using Prisma Accelerate URL, not direct PostgreSQL URL
2. Verify the API key is valid
3. Check that your database is accessible

### Google Drive upload fails
1. Verify service account has access to the folder
2. Check that the private key is properly formatted (with `\n` escapes)
3. Ensure Drive API is enabled in Google Cloud Console

## 📚 Additional Resources

- [Discord Interactions API](https://discord.com/developers/docs/interactions/overview)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Prisma Accelerate](https://www.prisma.io/data-platform/accelerate)
- [Original Bot Documentation](../bot/README.md)

## 🔐 Security Notes

- Never commit `.dev.vars` or `.env` files
- Use `wrangler secret put` for production secrets
- Keep service account keys secure
- Regularly rotate Discord bot token and API keys

## 📄 License

MIT
