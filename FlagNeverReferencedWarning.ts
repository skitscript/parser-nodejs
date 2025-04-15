import type { Identifier } from './Identifier'

/**
 * A flag is set but never referenced.
 */
export interface FlagNeverReferencedWarning {
  /**
   * Identifies the type of warning.
   */
  readonly type: 'flag_never_referenced'

  /**
   * The line from which the warning originates.
   */
  readonly line: number

  /**
   * The name of the flag.
   */
  readonly flag: Identifier
}

/* c8 ignore next */
