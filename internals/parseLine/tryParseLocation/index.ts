import type { IdentifierInstance } from '../../../IdentifierInstance/index.js'
import type { IdentifierType } from '../../../IdentifierType/index.js'
import type { Warning } from '../../../Warning/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsC } from '../../characterIsC/index.js'
import { characterIsColon } from '../../characterIsColon/index.js'
import { characterIsI } from '../../characterIsI/index.js'
import { characterIsL } from '../../characterIsL/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import type { LocalIdentifierInstance } from '../../LocalIdentifierInstance/index.js'
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

  const newIdentifierInstances: IdentifierInstance[] = []
  const newWarnings: Warning[] = []
  const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
    character: {},
    emote: {},
    entryAnimation: {},
    exitAnimation: {},
    label: {},
    flag: {},
    location: {}
  }

  const location = tryParseIdentifier(parserState, fromColumn, toColumn, 'location', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

  if (location === null) {
    return false
  }

  parserState.identifierInstances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    parserState.instructions.push({
      type: 'location',
      line: parserState.line,
      location
    })
  }

  return true
}
