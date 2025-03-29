import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsC } from '../../characterIsC/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsL } from '../../characterIsL/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseClear = (parserState: ParserState, indexOfLastNonWhiteSpaceCharacter: number): boolean => {
  if (indexOfLastNonWhiteSpaceCharacter < 7) {
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

  const flagsAndIdentifiers = tryParseAndIdentifierList(parserState, 6, indexOfLastNonWhiteSpaceCharacter - 1)

  if (flagsAndIdentifiers === null) {
    return false
  }

  addIdentifierListToIndex(parserState, flagsAndIdentifiers[1], 'flag', 'implicitDeclaration')

  if (checkReachable(parserState, indexOfLastNonWhiteSpaceCharacter)) {
    for (const flag of flagsAndIdentifiers[0]) {
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
