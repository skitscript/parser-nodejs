import type { IdentifierReference } from './IdentifierReference'
import type { IdentifierContext } from './IdentifierContext'
import type { IdentifierType } from './IdentifierType'

/**
 * An instance of an identifier within a document.
 */
export type IdentifierInstance = {
  /**
   * The type of the identifier instance.
   */
  readonly type: IdentifierType

  /**
   * The context in which the identifier is being used.
   */
  readonly context: IdentifierContext
} & IdentifierReference

/* c8 ignore next */
