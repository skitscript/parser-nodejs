import type { ParserState } from '../../ParserState'
import { tryParseMultiCharacterEmote } from './tryParseMultiCharacterEmote/index.js'
import { tryParseSingleCharacterEmote } from './tryParseSingleCharacterEmote/index.js'

export const tryParseEmote = (parserState: ParserState): boolean =>
  tryParseMultiCharacterEmote(parserState) ||
tryParseSingleCharacterEmote(parserState)
