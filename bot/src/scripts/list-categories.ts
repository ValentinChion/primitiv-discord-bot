import { config } from "dotenv";
import chalk from "chalk";

config({ path: ".dev.vars" });

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  parent_id?: string;
  position?: number;
}

async function fetchAllCategories() {
  const guildId = process.env.GUILD_ID;
  const token = process.env.DISCORD_TOKEN;

  if (!guildId || !token) {
    console.log(chalk.red("❌ Missing GUILD_ID or DISCORD_TOKEN in .dev.vars"));
    process.exit(1);
  }

  console.log(chalk.cyan.bold("\n🔍 Fetching all channels and categories...\n"));

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch channels: ${response.status} ${response.statusText}`);
    }

    const channels = (await response.json()) as DiscordChannel[];

    // Separate categories and text channels
    const categories = channels.filter((ch) => ch.type === 4).sort((a, b) => (a.position || 0) - (b.position || 0));
    const textChannels = channels.filter((ch) => ch.type === 0 || ch.type === 5);

    console.log(chalk.green(`✓ Found ${chalk.bold(categories.length)} categories`));
    console.log(chalk.green(`✓ Found ${chalk.bold(textChannels.length)} text channels\n`));

    console.log(chalk.cyan.bold("=".repeat(60)));
    console.log(chalk.cyan.bold("📁 CATEGORIES & CHANNELS"));
    console.log(chalk.cyan.bold("=".repeat(60) + "\n"));

    // Show categories with their channels
    for (const category of categories) {
      console.log(chalk.yellow.bold(`📂 ${category.name}`));
      console.log(chalk.gray(`   ID: ${category.id}`));

      const channelsInCategory = textChannels
        .filter((ch) => ch.parent_id === category.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      if (channelsInCategory.length > 0) {
        channelsInCategory.forEach((ch) => {
          const typeLabel = ch.type === 5 ? chalk.cyan("[Announcement]") : "";
          console.log(chalk.white(`   • #${ch.name} ${typeLabel}`));
        });
      } else {
        console.log(chalk.gray(`   (no text channels)`));
      }
      console.log("");
    }

    // Show uncategorized channels
    const uncategorizedChannels = textChannels
      .filter((ch) => !ch.parent_id)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    if (uncategorizedChannels.length > 0) {
      console.log(chalk.yellow.bold(`📂 UNCATEGORIZED`));
      uncategorizedChannels.forEach((ch) => {
        const typeLabel = ch.type === 5 ? chalk.cyan("[Announcement]") : "";
        console.log(chalk.white(`   • #${ch.name} ${typeLabel}`));
      });
      console.log("");
    }

    console.log(chalk.cyan.bold("=".repeat(60)));
    console.log(chalk.cyan.bold("\n💡 Category Summary (for filtering):\n"));

    // Show a simple list of category names
    console.log(chalk.white("Category names (copy these for filtering):"));
    categories.forEach((cat) => {
      console.log(chalk.blue(`  - "${cat.name}"`));
    });

    console.log(chalk.cyan.bold("\n" + "=".repeat(60) + "\n"));
  } catch (error) {
    console.log(chalk.red("❌ Error fetching categories:"), error);
    process.exit(1);
  }
}

fetchAllCategories();
