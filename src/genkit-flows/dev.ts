'use server';
import { config } from 'dotenv';
config();

import '@/genkit-flows/flows/adapt-ui-color-to-account-context.ts';
import '@/genkit-flows/flows/extract-invoice-items.ts';
