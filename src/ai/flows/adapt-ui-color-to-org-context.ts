'use server';
/**
 * @fileOverview Adapts the UI color scheme to match the organization's identity description.
 *
 * - adaptUIColorToOrgContext - Determines appropriate colors based on the dimension identity description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptUIColorToOrgContextInputSchema = z.object({
  organizationContext: z
    .string()
    .describe('A brief description of the dimension identity (its character, industry, or vibe).'),
});
export type AdaptUIColorToOrgContextInput = z.infer<
  typeof AdaptUIColorToOrgContextInputSchema
>;

const AdaptUIColorToOrgContextOutputSchema = z.object({
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
export type AdaptUIColorToOrgContextOutput = z.infer<
  typeof AdaptUIColorToOrgContextOutputSchema
>;

export async function adaptUIColorToOrgContext(
  input: AdaptUIColorToOrgContextInput
): Promise<AdaptUIColorToOrgContextOutput> {
  return adaptUIColorToOrgContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptUIColorToOrgContextPrompt',
  input: {schema: AdaptUIColorToOrgContextInputSchema},
  output: {schema: AdaptUIColorToOrgContextOutputSchema},
  prompt: `Based on the dimension description: "{{{organizationContext}}}", determine appropriate UI colors that reflect its identity.

Return the colors as hexadecimal codes.

Style Guidelines:
- Primary: Should evoke trust and authority.
- Background: Clean and professional.
- Accent: Vibrant contrast for actions.

Output JSON with "primaryColor", "backgroundColor", and "accentColor".
`,
});

const adaptUIColorToOrgContextFlow = ai.defineFlow(
  {
    name: 'adaptUIColorToOrgContextFlow',
    inputSchema: AdaptUIColorToOrgContextInputSchema,
    outputSchema: AdaptUIColorToOrgContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
