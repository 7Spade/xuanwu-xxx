import type { AIProvider } from "./provider.types"

/**
 * OpenAI provider stub.
 *
 * To enable:
 * 1. `npm install openai`
 * 2. Set the `OPENAI_API_KEY` environment variable.
 * 3. Replace this stub with the real implementation using the OpenAI SDK.
 * 4. Update `src/ai/index.ts` to export `openaiProvider`.
 */
export const openaiProvider: AIProvider = {
  async generateObject() {
    throw new Error(
      'OpenAI provider is not configured. ' +
        'Install the "openai" package and set OPENAI_API_KEY.'
    )
  },

  async generateObjectFromMedia() {
    throw new Error(
      'OpenAI provider is not configured. ' +
        'Install the "openai" package and set OPENAI_API_KEY.'
    )
  },
}
