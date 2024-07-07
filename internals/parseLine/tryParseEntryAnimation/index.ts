import type { ParserState } from '../../ParserState'
import { tryParseMultiCharacterEntryAnimation } from './tryParseMultiCharacterEntryAnimation/index.js'
import { tryParseSingleCharacterEntryAnimation } from './tryParseSingleCharacterEntryAnimation/index.js'

export const tryParseEntryAnimation = (parserState: ParserState): boolean =>
  tryParseMultiCharacterEntryAnimation(parserState) ||
 tryParseSingleCharacterEntryAnimation(parserState)
