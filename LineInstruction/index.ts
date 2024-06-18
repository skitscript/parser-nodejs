import type { Formatted } from '../Formatted'

/**
 * Specifies that a line of dialog is to be shown.
 */
export interface LineInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'line'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The content of the line.
   */
  readonly content: Formatted
}
