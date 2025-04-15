import type { Identifier } from './Identifier'

/**
 * The same identifier is present two or more times in the same list.
 */
export interface DuplicateIdentifierInListWarning {
  /**
   * Identifies the type of warning.
   */
  readonly type: 'duplicateIdentifierInList'

  /**
   * The line from which the warning originates.
   */
  readonly line: number

  /**
   * The first occurrence of the identifier.
   */
  readonly first: Identifier

  /**
   * The second occurrence of the identifier.
   */
  readonly second: Identifier
}

/* c8 ignore next */
