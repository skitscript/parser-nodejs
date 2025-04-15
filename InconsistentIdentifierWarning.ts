import type { IdentifierReference } from './IdentifierReference'

/**
 * Two or more identifiers are different but normalize to the same value.
 */
export interface InconsistentIdentifierWarning {
  /**
   * Identifies the type of warning.
   */
  readonly type: 'inconsistent_identifier'

  /**
   * The first occurrence of the identifier.
   */
  readonly first: IdentifierReference

  /**
   * The second occurrence of the identifier.
   */
  readonly second: IdentifierReference
}

/* c8 ignore next */
