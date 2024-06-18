import type { Identifier } from '../Identifier'

/**
 * Specifies that a label was declared here.  This does not, itself, do anything
 * at runtime, but needs to be retained as it can indicate the end of a menu.
 */
export interface LabelInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'label'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The name of the label.
   */
  readonly label: Identifier
}
