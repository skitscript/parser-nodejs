import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'

export const tryParseLocation = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 10) {
    return false
  }

  if (parserState.lowerCaseLineAccumulator.charAt(0) !== 'l' ||
   parserState.lowerCaseLineAccumulator.charAt(1) !== 'o' ||
    parserState.lowerCaseLineAccumulator.charAt(2) !== 'c' ||
    parserState.lowerCaseLineAccumulator.charAt(3) !== 'a' ||
    parserState.lowerCaseLineAccumulator.charAt(4) !== 't' ||
    parserState.lowerCaseLineAccumulator.charAt(5) !== 'i' ||
    parserState.lowerCaseLineAccumulator.charAt(6) !== 'o' ||
    parserState.lowerCaseLineAccumulator.charAt(7) !== 'n') {
    return false
  }

  let indexOfSemicolon = 8

  while (true) {
    if (indexOfSemicolon === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (parserState.lowerCaseLineAccumulator.charAt(indexOfSemicolon) === ':') {
      break
    }

    indexOfSemicolon++
  }

  let fromColumn = indexOfSemicolon + 1

  while (true) {
    if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (!characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(fromColumn))) {
      break
    }

    fromColumn++
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (true) {
    if (!characterIsWhitespace(parserState.lowerCaseLineAccumulator.charAt(toColumn))) {
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
