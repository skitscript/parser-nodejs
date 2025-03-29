import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsC } from '../../characterIsC/index.js'
import { characterIsColon } from '../../characterIsColon/index.js'
import { characterIsI } from '../../characterIsI/index.js'
import { characterIsL } from '../../characterIsL/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseLocation = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 10) {
    return false
  }

  if (!characterIsL(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!characterIsO(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!characterIsC(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!characterIsA(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!characterIsT(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  if (!characterIsI(parserState.lineAccumulator.charAt(5))) {
    return false
  }

  if (!characterIsO(parserState.lineAccumulator.charAt(6))) {
    return false
  }

  if (!characterIsN(parserState.lineAccumulator.charAt(7))) {
    return false
  }

  let indexOfColon = 8

  while (true) {
    if (indexOfColon === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (characterIsColon(parserState.lineAccumulator.charAt(indexOfColon))) {
      break
    }

    indexOfColon++
  }

  let fromColumn = indexOfColon + 1

  while (true) {
    if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (!characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
      break
    }

    fromColumn++
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (true) {
    if (!characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
      break
    }

    toColumn--
  }

  const background = tryParseIdentifier(parserState, fromColumn, toColumn)

  if (background === null) {
    return false
  }

  addIdentifierToIndex(parserState, background, 'background', 'implicitDeclaration')

  if (checkReachable(parserState)) {
    parserState.instructions.push({
      type: 'location',
      line: parserState.line,
      background
    })

    checkIdentifierConsistency(parserState, 'background', background)
  }

  return true
}
