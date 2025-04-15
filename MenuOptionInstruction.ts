import type { Condition } from './Condition'
import type { Formatted } from './Formatted'
import type { Identifier } from './Identifier'

/**
 * Specifies that a menu option is to be appended to the most recent line.
 */
export interface MenuOptionInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'menuOption'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The content of the menu option as shown to the user.
   */
  readonly content: Formatted

  /**
   * The name of the label to which to jump when the menu option is selected.
   */
  readonly label: Identifier

  /**
   * The instruction index to which to jump when the menu option is selected.
   */
  readonly instructionIndex: number

  /**
   * The condition which must be met for the menu option to be shown; when null,
   * the menu option is always shown.
   */
  readonly condition: null | Condition
}

/* c8 ignore next */
