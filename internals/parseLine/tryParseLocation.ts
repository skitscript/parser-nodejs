import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsA } from './codepointIsA.js'
import { codepointIsC } from './codepointIsC.js'
import { codepointIsColon } from './codepointIsColon.js'
import { codepointIsI } from './codepointIsI.js'
import { codepointIsL } from './codepointIsL.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsO } from './codepointIsO.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'

export const tryParseLocation = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 10) {
    return false
  }

  if (!codepointIsL(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!codepointIsO(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!codepointIsC(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!codepointIsA(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!codepointIsT(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  if (!codepointIsI(parserState.lineAccumulator.charAt(5))) {
    return false
  }

  if (!codepointIsO(parserState.lineAccumulator.charAt(6))) {
    return false
  }

  if (!codepointIsN(parserState.lineAccumulator.charAt(7))) {
    return false
  }

  let indexOfColon = 8

  while (true) {
    if (indexOfColon === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (codepointIsColon(parserState.lineAccumulator.charAt(indexOfColon))) {
      break
    }

    indexOfColon++
  }

  let fromColumn = indexOfColon + 1

  while (true) {
    if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return false
    }

    if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
      break
    }

    fromColumn++
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (true) {
    if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
      break
    }

    toColumn--
  }

  const newIdentifierInstances: IdentifierInstance[] = []
  const newWarnings: Warning[] = []
  const newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; } = {
    character: {},
    emote: {},
    entry_animation: {},
    exit_animation: {},
    label: {},
    flag: {},
    location: {}
  }

  const location = tryParseIdentifier(parserState, fromColumn, toColumn, 'location', 'implicit_declaration', newIdentifierInstances, newWarnings, newIdentifiers)

  if (location === null) {
    return false
  }

  parserState.identifier_instances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    parserState.instructions.push({
      type: 'location',
      line: parserState.line,
      location
    })
  }

  return true
}
