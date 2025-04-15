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
   * The name of the location to display.
   */
  readonly location: Identifier
}

/* c8 ignore next */
