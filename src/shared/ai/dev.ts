'use server';
import { config } from 'dotenv';
config();

import '@/shared/ai/flows/adapt-ui-color-to-account-context.ts';
import '@/shared/ai/flows/extract-invoice-items.ts';
