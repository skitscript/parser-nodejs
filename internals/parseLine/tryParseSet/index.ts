import { characterIsE } from '../../characterIsE/index.js'
import { characterIsPeriod } from '../../characterIsPeriod/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseSet = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 5) {
    return false
  }

  if (!characterIsS(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!characterIsE(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!characterIsT(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!characterIsPeriod(parserState.lineAccumulator.charAt(indexOfLastNonWhiteSpaceCharacter))) {
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
