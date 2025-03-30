import type { Condition } from '../../../Condition'
import type { Identifier } from '../../../Identifier'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsR } from '../../characterIsR/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
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
  fromColumn: number
): null | readonly [Condition, readonly Identifier[]] => {
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
            index += 4
            continue
          }
        } else if (index < parserState.indexOfLastNonWhiteSpaceCharacter - 4) {
          if (isNot(parserState, index)) {
            if (foundOr) {
              return null
            } else if (foundAnd) {
              return null
            } else if (listStarts !== -1) {
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

  if (listStarts === -1) {
    return null
  }

  if (foundNot) {
    if (foundAnd) {
      const flagsAndIdentifiers = tryParseAndIdentifierList(parserState, listStarts, listEnds)

      if (flagsAndIdentifiers === null) {
        return null
      } else if (flagsAndIdentifiers[0].length === 1) {
        return [{
          type: 'flagClear',
          flag: flagsAndIdentifiers[0][0] as Identifier
        }, flagsAndIdentifiers[1]]
      } else {
        return [{
          type: 'someFlagsClear',
          flags: flagsAndIdentifiers[0]
        }, flagsAndIdentifiers[1]]
      }
    } else if (foundOr) {
      const flagsAndIdentifiers = tryParseOrIdentifierList(parserState, listStarts, listEnds)

      if (flagsAndIdentifiers === null) {
        return null
      } else if (flagsAndIdentifiers[0].length === 1) {
        return [{
          type: 'flagClear',
          flag: flagsAndIdentifiers[0][0] as Identifier
        }, flagsAndIdentifiers[1]]
      } else {
        return [{
          type: 'everyFlagClear',
          flags: flagsAndIdentifiers[0]
        }, flagsAndIdentifiers[1]]
      }
    } else {
      const flag = tryParseIdentifier(parserState, listStarts, listEnds)

      if (flag === null) {
        return null
      } else {
        return [{
          type: 'flagClear',
          flag
        }, [flag]]
      }
    }
  } else if (foundAnd) {
    const flagsAndIdentifiers = tryParseAndIdentifierList(parserState, listStarts, listEnds)

    if (flagsAndIdentifiers === null) {
      return null
    } else if (flagsAndIdentifiers[0].length === 1) {
      return [{
        type: 'flagSet',
        flag: flagsAndIdentifiers[0][0] as Identifier
      }, flagsAndIdentifiers[1]]
    } else {
      return [{
        type: 'everyFlagSet',
        flags: flagsAndIdentifiers[0]
      }, flagsAndIdentifiers[1]]
    }
  } else if (foundOr) {
    const flagsAndIdentifiers = tryParseOrIdentifierList(parserState, listStarts, listEnds)

    if (flagsAndIdentifiers === null) {
      return null
    } else if (flagsAndIdentifiers[0].length === 1) {
      return [{
        type: 'flagSet',
        flag: flagsAndIdentifiers[0][0] as Identifier
      }, flagsAndIdentifiers[1]]
    } else {
      return [{
        type: 'someFlagsSet',
        flags: flagsAndIdentifiers[0]
      }, flagsAndIdentifiers[1]]
    }
  } else {
    const flag = tryParseIdentifier(parserState, listStarts, listEnds)

    if (flag === null) {
      return null
    } else {
      return [{
        type: 'flagSet',
        flag
      }, [flag]]
    }
  }
}
