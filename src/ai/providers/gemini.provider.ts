import { ai } from "@/ai/genkit"
import type {
  AIProvider,
  GenerateObjectOptions,
  GenerateObjectFromMediaOptions,
} from "./provider.types"

function interpolate(
  template: string,
  variables: Record<string, string>
): string {
  return Object.entries(variables).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  )
}

/**
 * Gemini provider — powered by Genkit + Google AI.
 *
 * This is the default provider. To switch to a different provider,
 * update the export in `src/ai/index.ts`.
 */
export const geminiProvider: AIProvider = {
  async generateObject<TOutput>({
    promptTemplate,
    variables = {},
    outputSchema,
  }: GenerateObjectOptions<TOutput>): Promise<TOutput> {
    const prompt = interpolate(promptTemplate, variables)
    const { output } = await ai.generate({
      prompt,
      output: { schema: outputSchema },
    })
    if (output === null || output === undefined) {
      throw new Error("No output from Gemini")
    }
    return output as TOutput
  },

  async generateObjectFromMedia<TOutput>({
    prompt,
    mediaDataUri,
    outputSchema,
  }: GenerateObjectFromMediaOptions<TOutput>): Promise<TOutput> {
    const { output } = await ai.generate({
      prompt: [{ text: prompt }, { media: { url: mediaDataUri } }],
      output: { schema: outputSchema },
    })
    if (output === null || output === undefined) {
      throw new Error("No output from Gemini")
    }
    return output as TOutput
  },
}
