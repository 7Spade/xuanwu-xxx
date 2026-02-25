export type ParsingIntentStatus = 'pending' | 'imported' | 'superseded';

export interface ParsingIntentContract {
  intentId: string;
  workspaceId: string;
  sourceFileId: string;
  sourceVersionId: string;
  taskDraftCount: number;
  skillRequirements: string[];
  status: ParsingIntentStatus;
  supersedesIntentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateParsingIntentInput {
  intentId: string;
  workspaceId: string;
  sourceFileId: string;
  sourceVersionId: string;
  taskDraftCount: number;
  skillRequirements?: string[];
}

export function createParsingIntentContract(
  input: CreateParsingIntentInput
): ParsingIntentContract {
  const now = Date.now();
  return {
    intentId: input.intentId,
    workspaceId: input.workspaceId,
    sourceFileId: input.sourceFileId,
    sourceVersionId: input.sourceVersionId,
    taskDraftCount: input.taskDraftCount,
    skillRequirements: input.skillRequirements ?? [],
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

export function markParsingIntentImported(
  current: ParsingIntentContract
): ParsingIntentContract {
  return {
    ...current,
    status: 'imported',
    updatedAt: Date.now(),
  };
}

export function supersedeParsingIntent(
  current: ParsingIntentContract,
  nextIntentId: string
): ParsingIntentContract {
  return {
    ...current,
    status: 'superseded',
    supersedesIntentId: nextIntentId,
    updatedAt: Date.now(),
  };
}
