import type { Identifier } from '../../Identifier'
import type { IdentifierContext } from '../../IdentifierContext'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsA } from './characterIsA.js'
import { characterIsD } from './characterIsD.js'
import { characterIsN } from './characterIsN.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { tryParseIdentifierList } from './tryParseIdentifierList.js'

const isAnd = (parserState: ParserState, index: number): boolean => {
  if (characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
    if (characterIsA(parserState.lineAccumulator.charAt(index + 1))) {
      if (characterIsN(parserState.lineAccumulator.charAt(index + 2))) {
        if (characterIsD(parserState.lineAccumulator.charAt(index + 3))) {
          if (characterIsWhitespace(parserState.lineAccumulator.charAt(index + 4))) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      } else {
        return false
      }
    } else {
      return false
    }
  } else {
    return false
  }
}

export const tryParseAndIdentifierList = (
  parserState: ParserState,
  fromColumn: number,
  toColumn: number,
  type: IdentifierType,
  context: IdentifierContext,
  newIdentifierInstances: IdentifierInstance[],
  newWarnings: Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance> }
): null | readonly Identifier[] => {
  const quitLoopAt = toColumn - 4

  for (let index = fromColumn; index < quitLoopAt; index++) {
    if (isAnd(parserState, index)) {
      return tryParseIdentifierList(
        parserState,
        fromColumn,
        index,
        index + 4,
        toColumn,
        type,
        context,
        newIdentifierInstances,
        newWarnings,
        newIdentifiers
      )
    }
  }

  while (true) {
    if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
      return null
    } else if (characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
      fromColumn++
    } else {
      break
    }
  }

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const identifier = tryParseIdentifier(parserState, fromColumn, toColumn, type, context, newIdentifierInstances, newWarnings, newIdentifiers)

  if (identifier === null) {
    return null
  } else {
    return [identifier]
  }
}
