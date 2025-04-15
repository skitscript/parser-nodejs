import type { EveryFlagClearCondition } from './EveryFlagClearCondition'
import type { EveryFlagSetCondition } from './EveryFlagSetCondition'
import type { FlagClearCondition } from './FlagClearCondition'
import type { FlagSetCondition } from './FlagSetCondition'
import type { SomeFlagsClearCondition } from './SomeFlagsClearCondition'
import type { SomeFlagsSetCondition } from './SomeFlagsSetCondition'

/**
 * Represents a condition which must pass for the containing instruction to be
 * executed.
 */
export type Condition =
  | EveryFlagClearCondition
  | EveryFlagSetCondition
  | FlagClearCondition
  | FlagSetCondition
  | SomeFlagsClearCondition
  | SomeFlagsSetCondition

/* c8 ignore next */
