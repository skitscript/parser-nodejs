import type { Identifier } from './Identifier'

/**
 * A condition which passes when at least one flag in a set is clear.
 */
export interface SomeFlagsClearCondition {
  /**
   * Indicates the type of condition.
   */
  readonly type: 'someFlagsClear'

  /**
   * The names of the flags of which at least one must be clear for the condition to pass.
   */
  readonly flags: readonly Identifier[]
}

/* c8 ignore next */
