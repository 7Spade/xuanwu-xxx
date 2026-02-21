'use server';
/**
 * @fileOverview Extracts line items from an invoice or quote document.
 */

import { ai } from '@/shared/ai/genkit';
import { type z } from 'genkit';
import {
  ExtractInvoiceItemsInputSchema,
  ExtractInvoiceItemsOutputSchema,
} from '@/shared/ai/schemas/docu-parse';

export async function extractInvoiceItems(
  input: z.infer<typeof ExtractInvoiceItemsInputSchema>
): Promise<z.infer<typeof ExtractInvoiceItemsOutputSchema>> {
  return extractInvoiceItemsFlow(input);
}

const extractInvoiceItemsPrompt = ai.definePrompt({
  name: 'extractInvoiceItemsPrompt',
  input: { schema: ExtractInvoiceItemsInputSchema },
  output: { schema: ExtractInvoiceItemsOutputSchema },
  prompt: `You are an expert AI assistant for parsing financial documents like quotes and invoices.

Analyze the provided document and extract every single work item. For each item, extract the following:
- The item description (料號/品名).
- The quantity (數量).
- The unit price (單價).
- The discount amount (折扣).
- The final total price for the line item (小計) as the 'price' field.

Document: {{media url=documentDataUri}}
  
Follow these rules:
- The 'price' field should be the final amount after any discount.
- If a field is not explicitly present for an item, you can infer it from other fields (e.g., unitPrice = price / quantity).
- If quantity is not present, default to 1.
- If discount is not present, default to 0.
- Ensure all extracted numbers are parsed correctly, even if they contain commas.
- Return a JSON object with a "workItems" array.`,
});

const extractInvoiceItemsFlow = ai.defineFlow(
  {
    name: 'extractInvoiceItemsFlow',
    inputSchema: ExtractInvoiceItemsInputSchema,
    outputSchema: ExtractInvoiceItemsOutputSchema,
  },
  async (input) => {
    const { output } = await extractInvoiceItemsPrompt(input);
    if (!output) {
      throw new Error('No output from AI');
    }
    return {
      workItems: output.workItems,
    };
  }
);
