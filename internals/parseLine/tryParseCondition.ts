import type { Condition } from '../../Condition'
import type { Identifier } from '../../Identifier'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsA } from './codepointIsA.js'
import { codepointIsD } from './codepointIsD.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsO } from './codepointIsO.js'
import { codepointIsR } from './codepointIsR.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { tryParseIdentifierList } from './tryParseIdentifierList.js'

const isOr = (parserState: ParserState, index: number): boolean => {
  if (codepointIsO(parserState.lineAccumulator.charAt(index + 1))) {
    if (codepointIsR(parserState.lineAccumulator.charAt(index + 2))) {
      if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index + 3))) {
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
  if (codepointIsN(parserState.lineAccumulator.charAt(index))) {
    if (codepointIsO(parserState.lineAccumulator.charAt(index + 1))) {
      if (codepointIsT(parserState.lineAccumulator.charAt(index + 2))) {
        if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index + 3))) {
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
  if (codepointIsA(parserState.lineAccumulator.charAt(index + 1))) {
    if (codepointIsN(parserState.lineAccumulator.charAt(index + 2))) {
      if (codepointIsD(parserState.lineAccumulator.charAt(index + 3))) {
        if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index + 4))) {
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
      } else if (codepointIsWhitespace(parserState.lineAccumulator.charAt(fromColumn))) {
        fromColumn++
      } else {
        break
      }
    }
  }

  let toColumn = parserState.indexOfLastNonWhiteSpaceCharacter - 1

  while (codepointIsWhitespace(parserState.lineAccumulator.charAt(toColumn))) {
    toColumn--
  }

  const quitLoopAt = toColumn - 3

  for (let index = fromColumn; index < quitLoopAt; index++) {
    if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index))) {
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
            type: not ? 'flag_clear' : 'flag_set',
            flag: flags[0] as Identifier
          }
        } else {
          return {
            type: not ? 'every_flag_clear' : 'some_flags_set',
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
                type: not ? 'flag_clear' : 'flag_set',
                flag: flags[0] as Identifier
              }
            } else {
              return {
                type: not ? 'some_flags_clear' : 'every_flag_set',
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
      type: not ? 'flag_clear' : 'flag_set',
      flag
    }
  }
}
