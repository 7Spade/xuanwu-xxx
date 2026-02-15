'use server';

import { extractInvoiceItems } from '@/ai/flows/extract-invoice-items';
import { z } from 'zod';
import type { WorkItem } from '@/ai/schemas/docu-parse';

const actionInputSchema = z.object({
  documentDataUri: z.string().startsWith('data:'),
});

export type ActionState = {
  data?: { workItems: WorkItem[] };
  error?: string;
  fileName?: string;
};

export async function extractDataFromDocument(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const file = formData.get('file') as File | null;

  if (!file || file.size === 0) {
    return { error: 'Please select a file to upload.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(fileBuffer).toString('base64');
    const documentDataUri = `data:${file.type};base64,${base64String}`;

    const validatedInput = actionInputSchema.safeParse({ documentDataUri });
    if (!validatedInput.success) {
      return { error: 'Invalid file data URI.' };
    }

    const result = await extractInvoiceItems(validatedInput.data);

    if (!result || !result.workItems) {
      return {
        error:
          'Failed to extract data. The AI model returned an unexpected result.',
      };
    }

    return { data: result, fileName: file.name };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to process document: ${errorMessage}` };
  }
}
