import type { Condition } from '../../Condition'
import type { Identifier } from '../../Identifier'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsA } from '../characterIsA.js'
import { characterIsD } from '../characterIsD.js'
import { characterIsN } from '../characterIsN.js'
import { characterIsO } from '../characterIsO.js'
import { characterIsR } from '../characterIsR.js'
import { characterIsT } from '../characterIsT.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from '../tryParseIdentifier.js'
import { tryParseIdentifierList } from '../tryParseIdentifierList.js'

const isOr = (parserState: ParserState, index: number): boolean => {
  if (characterIsO(parserState.lineAccumulator.charAt(index + 1))) {
    if (characterIsR(parserState.lineAccumulator.charAt(index + 2))) {
      if (characterIsWhitespace(parserState.lineAccumulator.charAt(index + 3))) {
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
}

const isNot = (parserState: ParserState, index: number): boolean => {
  if (characterIsN(parserState.lineAccumulator.charAt(index))) {
    if (characterIsO(parserState.lineAccumulator.charAt(index + 1))) {
      if (characterIsT(parserState.lineAccumulator.charAt(index + 2))) {
        if (characterIsWhitespace(parserState.lineAccumulator.charAt(index + 3))) {
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
}

const isAnd = (parserState: ParserState, index: number): boolean => {
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
}

export const tryParseCondition = (
  parserState: ParserState,
  fromColumn: number,
  newIdentifierInstances: IdentifierInstance[],
  newWarnings: Warning[],
  newIdentifiers: { readonly [TIdentifierType in IdentifierType]: Record<string, LocalIdentifierInstance>; }
): null | Condition => {
  const not = fromColumn < parserState.indexOfLastNonWhiteSpaceCharacter - 3 && isNot(parserState, fromColumn)

  if (not) {
    fromColumn += 4

    while (true) {
      if (fromColumn === parserState.indexOfLastNonWhiteSpaceCharacter) {
        return null
      } else if (characterIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
        fromColumn++
      } else {
        break
      }
    }
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (characterIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const quitLoopAt = toColumn - 3

  for (let index = fromColumn; index < quitLoopAt; index++) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
      if (isOr(parserState, index)) {
        const flags = tryParseIdentifierList(
          parserState,
          fromColumn,
          index,
          index + 3,
          toColumn,
          'flag',
          'implicit_declaration',
          newIdentifierInstances,
          newWarnings,
          newIdentifiers
        )

        if (flags === null) {
          return null
        } else if (flags.length === 1) {
          return {
            type: not ? 'flagClear' : 'flagSet',
            flag: flags[0] as Identifier
          }
        } else {
          return {
            type: not ? 'everyFlagClear' : 'someFlagsSet',
            flags
          }
        }
      } else {
        if (index < parserState.indexOfLastNonWhiteSpaceCharacter - 4) {
          if (isAnd(parserState, index)) {
            const flags = tryParseIdentifierList(
              parserState,
              fromColumn,
              index,
              index + 4,
              toColumn,
              'flag',
              'implicit_declaration',
              newIdentifierInstances,
              newWarnings,
              newIdentifiers
            )

            if (flags === null) {
              return null
            } else if (flags.length === 1) {
              return {
                type: not ? 'flagClear' : 'flagSet',
                flag: flags[0] as Identifier
              }
            } else {
              return {
                type: not ? 'someFlagsClear' : 'everyFlagSet',
                flags
              }
            }
          }
        }
      }
    }
  }

  const flag = tryParseIdentifier(
    parserState,
    fromColumn,
    toColumn,
    'flag',
    'implicit_declaration',
    newIdentifierInstances,
    newWarnings,
    newIdentifiers
  )

  if (flag === null) {
    return null
  } else {
    return {
      type: not ? 'flagClear' : 'flagSet',
      flag
    }
  }
}
