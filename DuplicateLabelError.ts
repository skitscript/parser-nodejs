import type { IdentifierReference } from './IdentifierReference'

/**
 * Two or more labels share a name.
 */
export interface DuplicateLabelError {
  /**
   * Identifies the type of error.
   */
  readonly type: 'duplicate_label'

  /**
   * The first occurrence of the label.
   */
  readonly first: IdentifierReference

  /**
   * The second occurrence of the label.
   */
  readonly second: IdentifierReference
}

/* c8 ignore next */
