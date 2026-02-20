import type { ZodType } from "zod"

export interface GenerateObjectOptions<TOutput> {
  /** Prompt text with {{variable}} placeholders */
  promptTemplate: string
  /** Variables to substitute into the prompt */
  variables?: Record<string, string>
  /** Zod schema for the expected structured output */
  outputSchema: ZodType<TOutput>
}

export interface GenerateObjectFromMediaOptions<TOutput> {
  /** Prompt text describing what to extract */
  prompt: string
  /** Data URI of the media to analyze (e.g. data:image/jpeg;base64,...) */
  mediaDataUri: string
  /** Zod schema for the expected structured output */
  outputSchema: ZodType<TOutput>
}

/**
 * Provider-agnostic interface for Generative AI operations.
 *
 * Any AI backend (Gemini, OpenAI, Claude, …) must implement this interface.
 * Flows always call this interface — never a vendor SDK directly.
 */
export interface AIProvider {
  /** Generate structured JSON output from a text prompt */
  generateObject<TOutput>(
    opts: GenerateObjectOptions<TOutput>
  ): Promise<TOutput>

  /** Generate structured JSON output from a prompt + media (image / PDF) */
  generateObjectFromMedia<TOutput>(
    opts: GenerateObjectFromMediaOptions<TOutput>
  ): Promise<TOutput>
}
