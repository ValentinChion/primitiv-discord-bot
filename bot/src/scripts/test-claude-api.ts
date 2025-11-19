import { config } from "dotenv";
import chalk from "chalk";
import {
  callClaude,
  callClaudeForJSON,
  callClaudeStreaming,
} from "../services/claude.js";

config({ path: ".dev.vars" });

async function runExamples() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log(
      chalk.red("❌ Missing ANTHROPIC_API_KEY in .dev.vars")
    );
    console.log(
      chalk.yellow(
        "\nAdd this to your .dev.vars file:\nANTHROPIC_API_KEY=your_api_key_here"
      )
    );
    process.exit(1);
  }

  console.log(chalk.cyan.bold("\n" + "=".repeat(60)));
  console.log(chalk.cyan.bold("🤖 Claude API Examples"));
  console.log(chalk.cyan.bold("=".repeat(60) + "\n"));

  // Example 1: Simple prompt
  console.log(chalk.yellow.bold("Example 1: Simple Prompt\n"));
  try {
    const response1 = await callClaude(
      "What are the top 3 programming languages in 2024? Be concise.",
      null,
      { apiKey }
    );
    console.log(chalk.white("\nResponse:"));
    console.log(chalk.green(response1.content));
    console.log(
      chalk.gray(
        `\n(Used ${response1.usage.inputTokens} input + ${response1.usage.outputTokens} output tokens)`
      )
    );
  } catch (error) {
    console.log(chalk.red("Error in Example 1:"), error);
  }

  console.log(chalk.cyan("\n" + "─".repeat(60) + "\n"));

  // Example 2: Prompt with JSON data
  console.log(chalk.yellow.bold("Example 2: Analyze JSON Data\n"));
  try {
    const userData = {
      users: [
        { name: "Alice", messages: 42, active: true },
        { name: "Bob", messages: 15, active: false },
        { name: "Charlie", messages: 78, active: true },
      ],
      date: "2025-11-19",
    };

    const response2 = await callClaude(
      "Analyze this user activity data and provide a brief summary with insights.",
      userData,
      { apiKey }
    );
    console.log(chalk.white("\nResponse:"));
    console.log(chalk.green(response2.content));
  } catch (error) {
    console.log(chalk.red("Error in Example 2:"), error);
  }

  console.log(chalk.cyan("\n" + "─".repeat(60) + "\n"));

  // Example 3: Get JSON response
  console.log(chalk.yellow.bold("Example 3: Get Structured JSON Response\n"));
  try {
    const messages = [
      "Hello world!",
      "This is a test",
      "Claude is awesome",
      "AI is the future",
    ];

    const response3 = await callClaudeForJSON<{
      count: number;
      averageLength: number;
      summary: string;
    }>(
      "Analyze these messages and return ONLY a JSON object with this exact format: { count: number, averageLength: number, summary: string }",
      { messages },
      { apiKey, maxTokens: 1024 }
    );

    console.log(chalk.white("\nParsed JSON Response:"));
    console.log(chalk.green(JSON.stringify(response3, null, 2)));
    console.log(chalk.blue(`\nMessage count: ${response3.count}`));
    console.log(chalk.blue(`Average length: ${response3.averageLength}`));
    console.log(chalk.blue(`Summary: ${response3.summary}`));
  } catch (error) {
    console.log(chalk.red("Error in Example 3:"), error);
  }

  console.log(chalk.cyan("\n" + "─".repeat(60) + "\n"));

  // Example 4: Different models
  console.log(chalk.yellow.bold("Example 4: Using Haiku (faster, cheaper)\n"));
  try {
    const response4 = await callClaude(
      "Write a haiku about coding",
      null,
      {
        apiKey,
        model: "claude-3-5-haiku-20241022",
        maxTokens: 1024,
        temperature: 0.8,
      }
    );
    console.log(chalk.white("\nHaiku:"));
    console.log(chalk.green(response4.content));
  } catch (error) {
    console.log(chalk.red("Error in Example 4:"), error);
  }

  console.log(chalk.cyan("\n" + "─".repeat(60) + "\n"));

  // Example 5: Streaming (commented out by default as it can be verbose)
  console.log(
    chalk.yellow.bold("Example 5: Streaming Response (uncomment to test)\n")
  );
  console.log(
    chalk.gray(
      "Streaming is useful for long responses. Uncomment the code below to test."
    )
  );

  /*
  try {
    console.log(chalk.white("\nStreaming response:\n"));
    await callClaudeStreaming(
      "Tell me a very short story about a robot learning to code",
      null,
      { apiKey, maxTokens: 2048 },
      (chunk) => process.stdout.write(chalk.green(chunk))
    );
    console.log("\n");
  } catch (error) {
    console.log(chalk.red("Error in Example 5:"), error);
  }
  */

  console.log(chalk.cyan("\n" + "=".repeat(60)));
  console.log(chalk.green.bold("\n✅ All examples completed!\n"));
  console.log(chalk.cyan("=".repeat(60) + "\n"));
}

runExamples();
