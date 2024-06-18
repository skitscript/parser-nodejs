import type { IdentifierInstance } from '../IdentifierInstance'
import type { Error } from '../Error'
import type { Warning } from '../Warning'

/**
 * The result of parsing an invalid document.
 */
export interface InvalidDocument {
  /**
   * Indicates the type of parsing result.
   */
  readonly type: 'invalid'

  /**
   * The errors parsed from the document.
   */
  readonly errors: readonly Error[]

  /**
   * The warnings parsed from the document.
   */
  readonly warnings: readonly Warning[]

  /**
   * Every instance of an identifier parsed from the document.
   */
  readonly identifierInstances: readonly IdentifierInstance[]
}

/* c8 ignore next */
