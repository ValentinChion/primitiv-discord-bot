import { generateReport } from "../handlers/report";

const main = async () => {
  // Load dotenv only when running as CLI
  const { config } = await import("dotenv");
  config({ path: ".dev.vars" });

  // Parse command line arguments
  const sendToDiscord = process.argv.includes("--send-discord");

  await generateReport(process.env, sendToDiscord);
};

// Only run main() if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
