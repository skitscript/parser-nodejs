import type { Identifier } from './Identifier'

/**
 * Specifies that a character is to play an entry animation.
 */
export interface EntryAnimationInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'entryAnimation'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The name of the character which is to animate.
   */
  readonly character: Identifier

  /**
   * The name of the animation which is to be played.
   */
  readonly animation: Identifier
}

/* c8 ignore next */
