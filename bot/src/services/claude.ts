/**
 * Service for interacting with Claude API
 * Provides functionality to send prompts and JSON data to Claude and get structured responses
 */

import chalk from "chalk";

/**
 * Claude API request options
 */
export interface ClaudeAPIOptions {
  apiKey: string;
  model?: string; // Default: claude-3-5-sonnet-20241022
  maxTokens?: number; // Default: 4096
  temperature?: number; // Default: 1.0
}

/**
 * Claude API response
 */
export interface ClaudeAPIResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Anthropic API Message format
 */
interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Anthropic API Response format
 */
interface AnthropicAPIResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null | string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Claude API with a custom prompt and optional JSON data
 *
 * @param prompt - The instruction/prompt for Claude
 * @param jsonData - Optional JSON data to include in the prompt
 * @param options - API options (apiKey, model, maxTokens, temperature)
 * @returns Parsed response from Claude
 *
 * @example
 * // Simple prompt
 * const response = await callClaude(
 *   "What is the capital of France?",
 *   null,
 *   { apiKey: env.ANTHROPIC_API_KEY }
 * );
 *
 * @example
 * // With JSON data
 * const data = { users: ["Alice", "Bob"], count: 2 };
 * const response = await callClaude(
 *   "Analyze this user data and provide insights",
 *   data,
 *   { apiKey: env.ANTHROPIC_API_KEY }
 * );
 *
 * @example
 * // Custom model and parameters
 * const response = await callClaude(
 *   "Write a haiku about coding",
 *   null,
 *   {
 *     apiKey: env.ANTHROPIC_API_KEY,
 *     model: "claude-3-5-haiku-20241022",
 *     maxTokens: 1024,
 *     temperature: 0.7
 *   }
 * );
 */
export async function callClaude(
  prompt: string,
  jsonData: any = null,
  options: ClaudeAPIOptions
): Promise<ClaudeAPIResponse> {
  const {
    apiKey,
    model = "claude-3-5-sonnet-20241022",
    maxTokens = 4096,
    temperature = 1.0,
  } = options;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  // Build the user message
  let userMessage = prompt;
  if (jsonData !== null) {
    userMessage += `\n\nHere is the JSON data to analyze:\n\`\`\`json\n${JSON.stringify(
      jsonData,
      null,
      2
    )}\n\`\`\``;
  }

  const messages: AnthropicMessage[] = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  console.log(chalk.cyan(`\n🤖 Calling Claude API...`));
  console.log(chalk.gray(`   Model: ${model}`));
  console.log(chalk.gray(`   Max Tokens: ${maxTokens}`));
  console.log(chalk.gray(`   Temperature: ${temperature}`));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Claude API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as AnthropicAPIResponse;

    console.log(chalk.green(`✓ Claude API response received`));
    console.log(
      chalk.gray(`   Input tokens: ${data.usage.input_tokens}`)
    );
    console.log(
      chalk.gray(`   Output tokens: ${data.usage.output_tokens}`)
    );

    // Extract text content from response
    const content = data.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      content,
      stopReason: data.stop_reason,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
    };
  } catch (error) {
    console.log(chalk.red(`❌ Error calling Claude API:`), error);
    throw error;
  }
}

/**
 * Call Claude API and parse JSON response
 * Useful when you expect Claude to return structured JSON data
 *
 * @param prompt - The instruction/prompt for Claude (should ask for JSON output)
 * @param jsonData - Optional JSON data to include in the prompt
 * @param options - API options
 * @returns Parsed JSON object from Claude's response
 *
 * @example
 * const data = { messages: ["Hello", "World", "Test"] };
 * const result = await callClaudeForJSON(
 *   "Count the messages and return JSON with format: { count: number, summary: string }",
 *   data,
 *   { apiKey: env.ANTHROPIC_API_KEY }
 * );
 * console.log(result.count); // 3
 */
export async function callClaudeForJSON<T = any>(
  prompt: string,
  jsonData: any = null,
  options: ClaudeAPIOptions
): Promise<T> {
  const response = await callClaude(prompt, jsonData, options);

  try {
    // Try to extract JSON from code blocks first
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]) as T;
    }

    // Otherwise, try to parse the entire content
    return JSON.parse(response.content) as T;
  } catch (error) {
    console.log(
      chalk.yellow(
        `⚠️  Failed to parse JSON response. Raw content:\n${response.content}`
      )
    );
    throw new Error(
      `Failed to parse Claude response as JSON: ${error}`
    );
  }
}

/**
 * Call Claude API with streaming support (for long responses)
 * Note: This is a basic implementation. For production use, consider using the official Anthropic SDK
 *
 * @param prompt - The instruction/prompt for Claude
 * @param jsonData - Optional JSON data to include in the prompt
 * @param options - API options
 * @param onChunk - Callback function called for each chunk of text
 * @returns Complete response text
 *
 * @example
 * await callClaudeStreaming(
 *   "Write a long story about a robot",
 *   null,
 *   { apiKey: env.ANTHROPIC_API_KEY },
 *   (chunk) => process.stdout.write(chunk)
 * );
 */
export async function callClaudeStreaming(
  prompt: string,
  jsonData: any = null,
  options: ClaudeAPIOptions,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const {
    apiKey,
    model = "claude-3-5-sonnet-20241022",
    maxTokens = 4096,
    temperature = 1.0,
  } = options;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required");
  }

  // Build the user message
  let userMessage = prompt;
  if (jsonData !== null) {
    userMessage += `\n\nHere is the JSON data to analyze:\n\`\`\`json\n${JSON.stringify(
      jsonData,
      null,
      2
    )}\n\`\`\``;
  }

  const messages: AnthropicMessage[] = [
    {
      role: "user",
      content: userMessage,
    },
  ];

  console.log(chalk.cyan(`\n🤖 Calling Claude API (streaming)...`));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Claude API error (${response.status}): ${errorText}`
      );
    }

    let fullText = "";

    // Note: This is a simplified streaming implementation
    // For production, use the official Anthropic SDK
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            if (json.type === "content_block_delta" && json.delta?.text) {
              const text = json.delta.text;
              fullText += text;
              if (onChunk) {
                onChunk(text);
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }

    console.log(chalk.green(`\n✓ Streaming complete`));
    return fullText;
  } catch (error) {
    console.log(chalk.red(`❌ Error in streaming Claude API:`), error);
    throw error;
  }
}
