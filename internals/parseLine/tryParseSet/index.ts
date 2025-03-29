import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseSet = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 5) {
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

  const flagsAndIdentifiers = tryParseAndIdentifierList(parserState, 4, parserState.indexOfLastNonWhiteSpaceCharacter - 1)

  if (flagsAndIdentifiers === null) {
    return false
  }

  addIdentifierListToIndex(parserState, flagsAndIdentifiers[1], 'flag', 'implicitDeclaration')

  if (checkReachable(parserState)) {
    for (const flag of flagsAndIdentifiers[0]) {
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
