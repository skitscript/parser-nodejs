import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseClear = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 7) {
    return false
  }

  if (parserState.lowerCaseLineAccumulator.charAt(0) !== 'c' ||
   parserState.lowerCaseLineAccumulator.charAt(1) !== 'l' ||
   parserState.lowerCaseLineAccumulator.charAt(2) !== 'e' ||
   parserState.lowerCaseLineAccumulator.charAt(3) !== 'a' ||
   parserState.lowerCaseLineAccumulator.charAt(4) !== 'r') {
    return false
  }

  if (!characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(5))) {
    return false
  }

  const flags = tryParseAndIdentifierList(parserState, 6, parserState.indexOfLastNonWhiteSpaceCharacter - 1, 'flag')

  if (flags === null) {
    return false
  }

  if (checkReachable(parserState)) {
    for (const flag of flags) {
      parserState.instructions.push({
        type: 'clear',
        line: parserState.line,
        flag
      })

      checkIdentifierConsistency(parserState, 'flag', flag)
    }
  }

  return true
}
