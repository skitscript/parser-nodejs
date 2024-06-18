import type { Identifier } from '../Identifier'

/**
 * A condition which passes when a flag is set.
 */
export interface FlagSetCondition {
  /**
   * Indicates the type of condition.
   */
  readonly type: 'flagSet'

  /**
   * The name of the flag which must be set for the condition to pass.
   */
  readonly flag: Identifier
}

/* c8 ignore next */
