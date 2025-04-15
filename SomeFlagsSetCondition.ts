import type { Identifier } from './Identifier'

/**
 * A condition which passes when at least one flag in a set is set.
 */
export interface SomeFlagsSetCondition {
  /**
   * Indicates the type of condition.
   */
  readonly type: 'some_flags_set'

  /**
   * The names of the flags of which at least one must be set for the condition to pass.
   */
  readonly flags: readonly Identifier[]
}

/* c8 ignore next */
