'use server';
/**
 * @fileOverview Adapts the UI color scheme to match the account's identity description.
 *
 * - adaptUIColorToAccountContext - Determines appropriate colors based on the dimension identity description.
 */

import {ai} from '@/shared/ai/genkit';
import {z} from 'genkit';

const AdaptUIColorToAccountContextInputSchema = z.object({
  accountContext: z
    .string()
    .describe('A brief description of the dimension identity (its character, industry, or vibe).'),
});
export type AdaptUIColorToAccountContextInput = z.infer<
  typeof AdaptUIColorToAccountContextInputSchema
>;

const AdaptUIColorToAccountContextOutputSchema = z.object({
  primaryColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the primary color.'
    ),
  backgroundColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the background color.'
    ),
  accentColor: z
    .string()
    .describe(
      'A hexadecimal color code representing the accent color.'
    ),
});
export type AdaptUIColorToAccountContextOutput = z.infer<
  typeof AdaptUIColorToAccountContextOutputSchema
>;

export async function adaptUIColorToAccountContext(
  input: AdaptUIColorToAccountContextInput
): Promise<AdaptUIColorToAccountContextOutput> {
  return adaptUIColorToAccountContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptUIColorToAccountContextPrompt',
  input: {schema: AdaptUIColorToAccountContextInputSchema},
  output: {schema: AdaptUIColorToAccountContextOutputSchema},
  prompt: `Based on the dimension description: "{{{accountContext}}}", determine appropriate UI colors that reflect its identity.

Return the colors as hexadecimal codes.

Style Guidelines:
- Primary: Should evoke trust and authority.
- Background: Clean and professional.
- Accent: Vibrant contrast for actions.

Output JSON with "primaryColor", "backgroundColor", and "accentColor".
`,
});

const adaptUIColorToAccountContextFlow = ai.defineFlow(
  {
    name: 'adaptUIColorToAccountContextFlow',
    inputSchema: AdaptUIColorToAccountContextInputSchema,
    outputSchema: AdaptUIColorToAccountContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
