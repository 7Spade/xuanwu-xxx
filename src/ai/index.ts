import { geminiProvider } from "./providers/gemini.provider"
// import { openaiProvider } from './providers/openai.provider'
// import { claudeProvider } from './providers/claude.provider'
import type { AIProvider } from "./providers/provider.types"

/**
 * Active AI provider used by all flows in this directory.
 *
 * To switch providers, change the import and assignment below.
 * Available providers:
 *   - geminiProvider  (default — requires GOOGLE_GENAI_API_KEY)
 *   - openaiProvider  (requires openai package + OPENAI_API_KEY)
 *   - claudeProvider  (requires @anthropic-ai/sdk + ANTHROPIC_API_KEY)
 */
export const aiProvider: AIProvider = geminiProvider
