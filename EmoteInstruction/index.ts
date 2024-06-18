import type { Identifier } from '../Identifier'

/**
 * Specifies that a character is to display an emote.
 */
export interface EmoteInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'emote'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The name of the character which is to display an emote.
   */
  readonly character: Identifier

  /**
   * The name of the emote which is to be displayed.
   */
  readonly emote: Identifier
}

/* c8 ignore next */
