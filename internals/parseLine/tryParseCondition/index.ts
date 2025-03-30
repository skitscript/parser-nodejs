import type { Condition } from '../../../Condition'
import type { Identifier } from '../../../Identifier'
import type { IdentifierInstance } from '../../../IdentifierInstance'
import type { IdentifierType } from '../../../IdentifierType'
import type { Warning } from '../../../Warning'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import type { LocalIdentifierInstance } from '../../LocalIdentifierInstance'
import type { ParserState } from '../../ParserState'
import { tryParseAndIdentifierList } from '../../tryParseAndIdentifierList/index.js'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { tryParseOrIdentifierList } from '../../tryParseOrIdentifierList/index.js'

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
  if (characterIsN(parserState.lineAccumulator.charAt(index + 1))) {
    if (characterIsO(parserState.lineAccumulator.charAt(index + 2))) {
      if (characterIsT(parserState.lineAccumulator.charAt(index + 3))) {
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
  let foundNot = false
  let foundOr = false
  let foundAnd = false
  let listStarts = -1
  let listEnds = -1

  for (let index = fromColumn - 1; index < parserState.indexOfLastNonWhiteSpaceCharacter;) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsWhitespace(character)) {
      if (index < parserState.indexOfLastNonWhiteSpaceCharacter - 3) {
        if (isOr(parserState, index)) {
          if (foundOr) {
            return null
          } else if (foundAnd) {
            return null
          } else if (listStarts === -1) {
            return null
          } else {
            foundOr = true
            index += 3
            continue
          }
        } else if (index < parserState.indexOfLastNonWhiteSpaceCharacter - 4) {
          if (isNot(parserState, index)) {
            if (listStarts !== -1) {
              return null
            } else {
              foundNot = true
              index += 4
              continue
            }
          } else if (isAnd(parserState, index)) {
            if (foundOr) {
              return null
            } else if (foundAnd) {
              return null
            } else if (listStarts === -1) {
              return null
            } else {
              foundAnd = true
              index += 4
              continue
            }
          } else {
            index++
            continue
          }
        } else {
          index++
          continue
        }
      } else {
        index++
        continue
      }
    } else {
      if (listStarts === -1) {
        listStarts = index
      }

      listEnds = index

      index++
      continue
    }
  }

  if (foundNot) {
    if (foundAnd) {
      const flags = tryParseAndIdentifierList(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

      if (flags === null) {
        return null
      } else if (flags.length === 1) {
        return {
          type: 'flagClear',
          flag: flags[0] as Identifier
        }
      } else {
        return {
          type: 'someFlagsClear',
          flags
        }
      }
    } else if (foundOr) {
      const flags = tryParseOrIdentifierList(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

      if (flags === null) {
        return null
      } else if (flags.length === 1) {
        return {
          type: 'flagClear',
          flag: flags[0] as Identifier
        }
      } else {
        return {
          type: 'everyFlagClear',
          flags
        }
      }
    } else {
      const flag = tryParseIdentifier(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

      if (flag === null) {
        return null
      } else {
        return {
          type: 'flagClear',
          flag
        }
      }
    }
  } else if (foundAnd) {
    const flags = tryParseAndIdentifierList(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

    if (flags === null) {
      return null
    } else if (flags.length === 1) {
      return {
        type: 'flagSet',
        flag: flags[0] as Identifier
      }
    } else {
      return {
        type: 'everyFlagSet',
        flags
      }
    }
  } else if (foundOr) {
    const flags = tryParseOrIdentifierList(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

    if (flags === null) {
      return null
    } else if (flags.length === 1) {
      return {
        type: 'flagSet',
        flag: flags[0] as Identifier
      }
    } else {
      return {
        type: 'someFlagsSet',
        flags
      }
    }
  } else {
    const flag = tryParseIdentifier(parserState, listStarts, listEnds, 'flag', 'implicitDeclaration', newIdentifierInstances, newWarnings, newIdentifiers)

    if (flag === null) {
      return null
    } else {
      return {
        type: 'flagSet',
        flag
      }
    }
  }
}
