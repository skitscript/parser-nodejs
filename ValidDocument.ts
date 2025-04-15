import type { IdentifierInstance } from './IdentifierInstance'
import type { Instruction } from './Instruction'
import type { Warning } from './Warning'

/**
 * The result of parsing a valid document.
 */
export interface ValidDocument {
  /**
   * Indicates the type of parsing result.
   */
  readonly type: 'valid'

  /**
   * The instructions parsed from the document.
   */
  readonly instructions: readonly Instruction[]

  /**
   * The warnings parsed from the document.
   */
  readonly warnings: readonly Warning[]

  /**
   * Every instance of an identifier parsed from the document.
   */
  readonly identifier_instances: readonly IdentifierInstance[]
}

/* c8 ignore next */
