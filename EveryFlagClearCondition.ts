import type { Identifier } from './Identifier'

/**
 * A condition which passes when all flags in a set are clear.
 */
export interface EveryFlagClearCondition {
  /**
   * Indicates the type of condition.
   */
  readonly type: 'everyFlagClear'

  /**
   * The names of the flags which must be clear for the condition to pass.
   */
  readonly flags: readonly Identifier[]
}

/* c8 ignore next */
