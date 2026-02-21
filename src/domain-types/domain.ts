// Re-export barrel — kept for backward compatibility.
// Import from domain-specific sub-modules for clarity:
//   import type { ScheduleItem } from '@/domain-types/schedule'
//   import type { Account } from '@/domain-types/account'
//   import type { SkillTag } from '@/domain-types/skill'
export * from './account'
export * from './workspace'
export * from './schedule'
export * from './skill'
export * from './task'
export * from './daily'
export * from './audit'
