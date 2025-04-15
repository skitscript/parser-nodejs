import type { Identifier } from './Identifier'

/**
 * Specifies a change of speaker.
 */
export interface SpeakerInstruction {
  /**
   * Identifies the type of instruction.
   */
  readonly type: 'speaker'

  /**
   * The line from which the instruction originates.
   */
  readonly line: number

  /**
   * The names of the speaking characters.
   */
  readonly characters: readonly Identifier[]
}

/* c8 ignore next */
