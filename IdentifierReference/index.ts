import type { Identifier } from '../Identifier'

/**
 * A reference to an identifier on a specific line.
 */
export type IdentifierReference = Identifier & {
  /**
   * The line from which the identifier originates.
   */
  readonly line: number
}
