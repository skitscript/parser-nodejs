import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseSet = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 5) {
    return false
  }

  if (parserState.lowerCaseLineAccumulator.charAt(0) !== 's' ||
   parserState.lowerCaseLineAccumulator.charAt(1) !== 'e' ||
    parserState.lowerCaseLineAccumulator.charAt(2) !== 't') {
    return false
  }

  if (!characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(3))) {
    return false
  }

  const flags = tryParseAndIdentifierList(parserState, 4, indexOfLastNonWhiteSpaceCharacter - 1, 'flag')

  if (flags === null) {
    return false
  }

  if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
    for (const flag of flags) {
      parserState.instructions.push({
        type: 'set',
        line: parserState.line,
        flag
      })

      checkIdentifierConsistency(parserState, 'flag', flag)
    }
  }

  return true
}
