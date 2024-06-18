import type { Identifier } from '../Identifier'

/**
 * Specifies that a flag is to be set.
 */
export interface SetInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'set'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The names of the flag which is to be set.
   */
  readonly flag: Identifier
}

/* c8 ignore next */
