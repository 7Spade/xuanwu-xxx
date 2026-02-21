import type { Location } from './workspace.types'
import type { SkillRequirement } from './skill.types'
import type { Timestamp } from 'firebase/firestore'

export type ScheduleStatus = 'PROPOSAL' | 'OFFICIAL' | 'REJECTED';

export interface ScheduleItem {
  id: string;
  accountId: string; // The owning Organization ID
  workspaceId: string;
  workspaceName?: string;
  title: string;
  description?: string;
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
  startDate: Timestamp; // Firestore Timestamp
  endDate: Timestamp; // Firestore Timestamp
  status: ScheduleStatus;
  originType: 'MANUAL' | 'TASK_AUTOMATION';
  originTaskId?: string;
  assigneeIds: string[];
  location?: Location;
  /** Skill & staffing requirements proposed by the workspace. */
  requiredSkills?: SkillRequirement[];
}
