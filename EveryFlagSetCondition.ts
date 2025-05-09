import type { Identifier } from './Identifier'

/**
 * A condition which passes when all flags in a set are set.
 */
export interface EveryFlagSetCondition {
  /**
   * Indicates the type of condition.
   */
  readonly type: 'every_flag_set'

  /**
   * The names of the flags which must be set for the condition to pass.
   */
  readonly flags: readonly Identifier[]
}

/* c8 ignore next */
