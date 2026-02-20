import type { AIProvider } from "./provider.types"

/**
 * Claude (Anthropic) provider stub.
 *
 * To enable:
 * 1. `npm install @anthropic-ai/sdk`
 * 2. Set the `ANTHROPIC_API_KEY` environment variable.
 * 3. Replace this stub with the real implementation using the Anthropic SDK.
 * 4. Update `src/ai/index.ts` to export `claudeProvider`.
 */
export const claudeProvider: AIProvider = {
  async generateObject() {
    throw new Error(
      'Claude provider is not configured. ' +
        'Install "@anthropic-ai/sdk" and set ANTHROPIC_API_KEY.'
    )
  },

  async generateObjectFromMedia() {
    throw new Error(
      'Claude provider is not configured. ' +
        'Install "@anthropic-ai/sdk" and set ANTHROPIC_API_KEY.'
    )
  },
}
