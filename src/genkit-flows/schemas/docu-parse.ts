import { z } from 'genkit';

/**
 * @fileOverview This file defines the Zod schemas and TypeScript types for the document parsing AI flow.
 */

export const WorkItemSchema = z.object({
  item: z.string().describe('The description of the work item.'),
  quantity: z.number().describe('The quantity of the work item.'),
  unitPrice: z.number().describe('The unit price of the work item.'),
  discount: z.number().describe('The discount for the work item.').optional(),
  price: z
    .number()
    .describe(
      "The final total price for the work item after discount (小計)."
    ),
});
export type WorkItem = z.infer<typeof WorkItemSchema>;

export const ExtractInvoiceItemsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document (invoice, quote) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export const ExtractInvoiceItemsOutputSchema = z.object({
  workItems: z
    .array(WorkItemSchema)
    .describe('A list of extracted work items.'),
});
