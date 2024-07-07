import type { ParserState } from '../../ParserState'
import { tryParseMultiCharacterExitAnimation } from './tryParseMultiCharacterExitAnimation/index.js'
import { tryParseSingleCharacterExitAnimation } from './tryParseSingleCharacterExitAnimation/index.js'

export const tryParseExitAnimation = (parserState: ParserState): boolean =>
  tryParseMultiCharacterExitAnimation(parserState) ||
tryParseSingleCharacterExitAnimation(parserState)
