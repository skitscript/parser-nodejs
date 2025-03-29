import type { Condition } from '../../../Condition'
import type { Identifier } from '../../../Identifier'
import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsA } from '../../characterIsA/index.js'
import { characterIsD } from '../../characterIsD/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsGreaterThan } from '../../characterIsGreaterThan/index.js'
import { characterIsH } from '../../characterIsH/index.js'
import { characterIsL } from '../../characterIsL/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsS } from '../../characterIsS/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsW } from '../../characterIsW/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkConditionConsistency } from '../../checkConditionConsistency/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import { parseFormatted } from '../../parseFormatted/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { tryParseCondition } from '../tryParseCondition/index.js'

const isLeads = (parserState: ParserState, index: number): boolean => {
  if (index >= 8) {
    if (characterIsS(parserState.lineAccumulator.charAt(index - 1))) {
      if (characterIsD(parserState.lineAccumulator.charAt(index - 2))) {
        if (characterIsA(parserState.lineAccumulator.charAt(index - 3))) {
          if (characterIsE(parserState.lineAccumulator.charAt(index - 4))) {
            if (characterIsL(parserState.lineAccumulator.charAt(index - 5))) {
              if (characterIsWhitespace(parserState.lineAccumulator.charAt(index - 6))) {
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
    } else {
      return false
    }
  } else {
    return false
  }
}

const isTo = (parserState: ParserState, index: number): boolean => {
  if (index >= 5) {
    if (characterIsO(parserState.lineAccumulator.charAt(index - 1))) {
      if (characterIsT(parserState.lineAccumulator.charAt(index - 2))) {
        if (characterIsWhitespace(parserState.lineAccumulator.charAt(index - 3))) {
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

const isWhen = (parserState: ParserState, index: number): boolean => {
  if (index >= 7) {
    if (characterIsN(parserState.lineAccumulator.charAt(index - 1))) {
      if (characterIsE(parserState.lineAccumulator.charAt(index - 2))) {
        if (characterIsH(parserState.lineAccumulator.charAt(index - 3))) {
          if (characterIsW(parserState.lineAccumulator.charAt(index - 4))) {
            if (characterIsWhitespace(parserState.lineAccumulator.charAt(index - 5))) {
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
  } else {
    return false
  }
}

export const tryParseMenuOption = (parserState: ParserState): boolean => {
  if (!characterIsGreaterThan(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  let unknownFrom = -1
  let unknownTo = -1
  let contentFrom = -1
  let contentTo = -1
  let foundLeads = false
  let labelFrom = -1
  let labelTo = -1
  let conditionFrom = -1
  let conditionTo = -1

  for (let index = parserState.indexOfLastNonWhiteSpaceCharacter - 1; index > 0;) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
      if (isWhen(parserState, index)) {
        if (conditionTo !== -1) {
          if (foundLeads) {
            index -= 5
          } else {
            return false
          }
        } else if (labelTo !== -1) {
          if (foundLeads) {
            index -= 5
          } else {
            return false
          }
        } else if (unknownTo === -1) {
          return false
        } else {
          conditionFrom = unknownFrom
          conditionTo = unknownTo
          unknownFrom = -1
          unknownTo = -1
          index -= 5
        }
      } else if (isTo(parserState, index)) {
        if (labelTo !== -1) {
          if (foundLeads) {
            index -= 3
          } else {
            return false
          }
        } else if (unknownTo === -1) {
          return false
        } else {
          labelFrom = unknownFrom
          labelTo = unknownTo
          unknownFrom = -1
          unknownTo = -1
          index -= 3
        }
      } else if (isLeads(parserState, index)) {
        if (foundLeads) {
          index -= 6
        } else if (labelTo !== -1) {
          foundLeads = true
          index -= 6
        } else {
          return false
        }
      } else {
        index--
      }
    } else if (foundLeads) {
      if (contentTo === -1) {
        contentTo = index
      }

      contentFrom = index

      index--
      // TODO: Reorder to remove -1 here and elsehwere
    } else if (labelTo !== -1) {
      return false
    } else {
      if (unknownTo === -1) {
        unknownTo = index
      }

      unknownFrom = index

      index--
    }
  }

  if (contentTo === -1) {
    return false
  }

  let conditionAndIdentifiers: null | readonly [Condition, readonly Identifier[]]

  if (conditionFrom === -1) {
    conditionAndIdentifiers = null
  } else {
    conditionAndIdentifiers = tryParseCondition(parserState, conditionFrom)

    if (conditionAndIdentifiers === null) {
      return false
    }
  }

  const label = tryParseIdentifier(parserState, labelFrom, labelTo)

  if (label === null) {
    return false
  }

  const content = parseFormatted(parserState, contentFrom, contentTo)

  if (content === null) {
    return false
  }

  addIdentifierToIndex(parserState, label, 'label', 'reference')

  if (conditionAndIdentifiers !== null) {
    addIdentifierListToIndex(parserState, conditionAndIdentifiers[1], 'flag', 'implicitDeclaration')
  }

  if (parserState.reachability !== 'unreachable') {
    parserState.instructions.push(
      {
        type: 'menuOption',
        line: parserState.line,
        content,
        label,
        instructionIndex: -1,
        condition: conditionAndIdentifiers === null ? null : conditionAndIdentifiers[0]
      }
    )

    checkIdentifierConsistency(parserState, 'label', label)

    checkConditionConsistency(parserState, conditionAndIdentifiers === null ? null : conditionAndIdentifiers[0])

    if (conditionAndIdentifiers === null) {
      parserState.reachability = 'willBecomeUnreachableAtEndOfCurrentMenu'
    }
  }

  return true
}
