# Claude API Utility

A simple utility service to call Claude API with custom prompts and JSON data.

## Location

- **Service File**: `bot/src/services/claude.ts`
- **Example Script**: `bot/src/scripts/test-claude-api.ts`

## Features

- ✅ Simple function to call Claude API with any prompt
- ✅ Support for JSON data input
- ✅ Structured JSON response parsing
- ✅ Streaming support for long responses
- ✅ Multiple model support (Sonnet, Haiku, Opus)
- ✅ Beautiful colored logging with chalk
- ✅ TypeScript types included

## Setup

### 1. Get an API Key

Get your Anthropic API key from: https://console.anthropic.com/

### 2. Add to Environment

Add to your `.dev.vars` file:

```bash
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

## Functions

### `callClaude(prompt, jsonData, options)`

Call Claude API with a custom prompt and optional JSON data.

**Parameters:**
- `prompt` (string): Your instruction/question for Claude
- `jsonData` (any): Optional JSON data to include in the prompt
- `options` (ClaudeAPIOptions): Configuration options
  - `apiKey` (required): Your Anthropic API key
  - `model` (optional): Model to use (default: `claude-3-5-sonnet-20241022`)
  - `maxTokens` (optional): Max tokens in response (default: 4096)
  - `temperature` (optional): Creativity level 0-1 (default: 1.0)

**Returns:** `Promise<ClaudeAPIResponse>`
- `content` (string): The text response from Claude
- `stopReason` (string): Why Claude stopped generating
- `usage` (object): Token usage information

### `callClaudeForJSON(prompt, jsonData, options)`

Same as `callClaude` but automatically parses the response as JSON.

**Returns:** `Promise<T>` - Parsed JSON object

### `callClaudeStreaming(prompt, jsonData, options, onChunk)`

Stream the response for long outputs.

**Additional Parameter:**
- `onChunk` (function): Callback called for each chunk of text

## Usage Examples

### Example 1: Simple Question

```typescript
import { callClaude } from './services/claude.js';

const response = await callClaude(
  "What are the benefits of TypeScript?",
  null,
  { apiKey: process.env.ANTHROPIC_API_KEY }
);

console.log(response.content);
```

### Example 2: Analyze JSON Data

```typescript
const userData = {
  users: [
    { name: "Alice", messages: 42 },
    { name: "Bob", messages: 15 }
  ]
};

const response = await callClaude(
  "Analyze this user data and provide insights",
  userData,
  { apiKey: process.env.ANTHROPIC_API_KEY }
);

console.log(response.content);
```

### Example 3: Get Structured JSON Response

```typescript
import { callClaudeForJSON } from './services/claude.js';

interface AnalysisResult {
  totalUsers: number;
  mostActive: string;
  summary: string;
}

const result = await callClaudeForJSON<AnalysisResult>(
  "Analyze the user data and return JSON with: totalUsers, mostActive, summary",
  userData,
  { apiKey: process.env.ANTHROPIC_API_KEY }
);

console.log(`Total users: ${result.totalUsers}`);
console.log(`Most active: ${result.mostActive}`);
```

### Example 4: Use Different Models

```typescript
// Use Haiku for faster, cheaper responses
const response = await callClaude(
  "Write a short poem",
  null,
  {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: "claude-3-5-haiku-20241022",
    maxTokens: 1024,
    temperature: 0.8
  }
);
```

### Example 5: Streaming Response

```typescript
import { callClaudeStreaming } from './services/claude.js';

await callClaudeStreaming(
  "Write a long story about AI",
  null,
  { apiKey: process.env.ANTHROPIC_API_KEY },
  (chunk) => process.stdout.write(chunk)
);
```

## Available Models

| Model | ID | Best For | Cost |
|-------|-----|----------|------|
| **Sonnet 3.5** | `claude-3-5-sonnet-20241022` | Balanced performance & intelligence | Medium |
| **Haiku 3.5** | `claude-3-5-haiku-20241022` | Fast responses, simple tasks | Low |
| **Opus 3** | `claude-3-opus-20240229` | Most intelligent, complex tasks | High |

## Testing

Run the example script to test all features:

```bash
cd bot
npm run test:claude-api
```

This will run 5 examples demonstrating different use cases.

## Integration Example: Analyze Discord Messages

Here's how you could use Claude to analyze Discord messages:

```typescript
import { getDailyChannelMessages } from './services/messages.js';
import { callClaudeForJSON } from './services/claude.js';

// 1. Fetch messages from Discord
const messages = await getDailyChannelMessages(guildId, new Date(), env);

// 2. Analyze with Claude
const analysis = await callClaudeForJSON(
  `Analyze these Discord messages and return JSON with:
  - totalMessages: number
  - topChannels: string[] (3 most active)
  - sentiment: "positive" | "neutral" | "negative"
  - summary: string (2-3 sentences)`,
  messages,
  {
    apiKey: env.ANTHROPIC_API_KEY!,
    model: "claude-3-5-sonnet-20241022"
  }
);

console.log(`Total messages: ${analysis.totalMessages}`);
console.log(`Top channels: ${analysis.topChannels.join(', ')}`);
console.log(`Sentiment: ${analysis.sentiment}`);
console.log(`Summary: ${analysis.summary}`);
```

## Error Handling

```typescript
try {
  const response = await callClaude(
    "Your prompt here",
    data,
    { apiKey: env.ANTHROPIC_API_KEY! }
  );
  console.log(response.content);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Invalid API key');
  } else if (error.message.includes('429')) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Rate Limits

Anthropic API rate limits (as of 2024):

- **Requests per minute**: Varies by tier
- **Tokens per minute**: Varies by tier
- **Concurrent requests**: Up to 5 for most tiers

See: https://docs.anthropic.com/en/api/rate-limits

## Token Usage & Costs

Monitor token usage from the response:

```typescript
const response = await callClaude(prompt, data, options);
console.log(`Input tokens: ${response.usage.inputTokens}`);
console.log(`Output tokens: ${response.usage.outputTokens}`);
```

Pricing (as of 2024):
- **Haiku 3.5**: $0.80 / 1M input tokens, $4.00 / 1M output
- **Sonnet 3.5**: $3.00 / 1M input, $15.00 / 1M output
- **Opus 3**: $15.00 / 1M input, $75.00 / 1M output

## Best Practices

1. **Be specific in prompts**: Clear instructions get better results
2. **Use appropriate models**: Haiku for simple tasks, Sonnet for complex
3. **Set reasonable max tokens**: Avoid unnecessary costs
4. **Handle errors gracefully**: API calls can fail
5. **Cache results**: Don't re-analyze the same data
6. **Use streaming for long outputs**: Better UX for users
7. **Monitor token usage**: Track costs in production

## TypeScript Types

```typescript
interface ClaudeAPIOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeAPIResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
```

## Advanced: Custom System Prompts

For more control, you can modify the service to support system prompts:

```typescript
// In claude.ts, add to the request body:
{
  model,
  max_tokens: maxTokens,
  temperature,
  system: "You are a helpful assistant specialized in Discord analytics.",
  messages
}
```

## Troubleshooting

### "Missing ANTHROPIC_API_KEY"
- Check `.dev.vars` file has the key
- Verify key starts with `sk-ant-`

### "401 Unauthorized"
- API key is invalid or expired
- Get a new key from console.anthropic.com

### "429 Rate Limit"
- You've exceeded API rate limits
- Wait and retry, or upgrade your tier

### JSON parsing fails
- Prompt might not be clear enough
- Try adding: "Return ONLY valid JSON, no explanations"
- Use triple backticks in prompt: "Return in ```json...``` format"

## Documentation

- **Anthropic API Docs**: https://docs.anthropic.com/
- **Model Comparison**: https://docs.anthropic.com/en/docs/models-overview
- **Prompt Engineering**: https://docs.anthropic.com/en/docs/prompt-engineering

## License

This utility is part of the Primitiv Discord Bot project.
