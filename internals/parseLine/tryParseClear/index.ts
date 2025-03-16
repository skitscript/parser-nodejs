import { characterIsA } from '../../characterIsA/index.js'
import { characterIsC } from '../../characterIsC/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsL } from '../../characterIsL/index.js'
import { characterIsPeriod } from '../../characterIsPeriod/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseClear = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 8) {
    return false
  }

  if (
    !characterIsC(parserState.lineAccumulator.charAt(0))
  ) {
    return false
  }

  if (!characterIsL(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!characterIsE(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!characterIsA(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!characterIsR(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(5))) {
    return false
  }

  if (!characterIsPeriod(parserState.lineAccumulator.charAt(indexOfLastNonWhiteSpaceCharacter))) {
    return false
  }

  const flags = tryParseAndIdentifierList(parserState, 6, indexOfLastNonWhiteSpaceCharacter - 1, 'flag')

  if (flags === null) {
    return false
  }

  if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
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
