import type { Identifier } from '../Identifier'

/**
 * Specifies a change of location.
 */
export interface LocationInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'location'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The name of the background to display.
   */
  readonly background: Identifier
}

/* c8 ignore next */
