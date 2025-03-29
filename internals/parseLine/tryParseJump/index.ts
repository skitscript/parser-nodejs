import type { Condition } from '../../../Condition'
import type { Identifier } from '../../../Identifier'
import { addIdentifierListToIndex } from '../../addIdentifierListToIndex/index.js'
import { addIdentifierToIndex } from '../../addIdentifierToIndex/index.js'
import { characterIsE } from '../../characterIsE/index.js'
import { characterIsH } from '../../characterIsH/index.js'
import { characterIsJ } from '../../characterIsJ/index.js'
import { characterIsM } from '../../characterIsM/index.js'
import { characterIsN } from '../../characterIsN/index.js'
import { characterIsO } from '../../characterIsO/index.js'
import { characterIsP } from '../../characterIsP/index.js'
import { characterIsT } from '../../characterIsT/index.js'
import { characterIsU } from '../../characterIsU/index.js'
import { characterIsW } from '../../characterIsW/index.js'
import { characterIsWhitespace } from '../../characterIsWhitespace/index.js'
import { checkConsistencyOfFlagIdentifiersInCondition } from '../../checkConsistencyOfFlagIdentifiersInCondition/index.js'
import { checkIdentifierConsistency } from '../../checkIdentifierConsistency/index.js'
import type { ParserState } from '../../ParserState'
import { tryParseIdentifier } from '../../tryParseIdentifier/index.js'
import { checkReachable } from '../checkReachable/index.js'
import { tryParseCondition } from '../tryParseCondition/index.js'

export const tryParseJump = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 8) {
    return false
  }

  if (!characterIsJ(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!characterIsU(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!characterIsM(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!characterIsP(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!characterIsWhitespace(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  let foundTo = false
  let index = 5

  for (; index < parserState.indexOfLastNonWhiteSpaceCharacter - 2; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsWhitespace(character)) {
      continue
    }

    if (!characterIsT(character)) {
      continue
    }

    if (!characterIsO(parserState.lineAccumulator.charAt(index + 1))) {
      continue
    }

    if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index + 2))) {
      continue
    }

    foundTo = true
    break
  }

  if (!foundTo) {
    return false
  }

  index += 3

  let labelFromColumn = -1
  let labelToColumn = -1
  let foundWhen = false

  for (; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (characterIsWhitespace(character)) {
      if (index + 6 < parserState.indexOfLastNonWhiteSpaceCharacter) {
        if (characterIsW(parserState.lineAccumulator.charAt(index + 1))) {
          if (characterIsH(parserState.lineAccumulator.charAt(index + 2))) {
            if (characterIsE(parserState.lineAccumulator.charAt(index + 3))) {
              if (characterIsN(parserState.lineAccumulator.charAt(index + 4))) {
                if (characterIsWhitespace(parserState.lineAccumulator.charAt(index + 5))) {
                  index += 6
                  foundWhen = true
                  break
                } else {
                  continue
                }
              } else {
                continue
              }
            } else {
              continue
            }
          } else {
            continue
          }
        } else {
          continue
        }
      } else {
        continue
      }
    } else {
      if (labelFromColumn === -1) {
        labelFromColumn = index
      }

      labelToColumn = index
    }
  }

  let conditionFromColumn = -1

  for (; index < parserState.indexOfLastNonWhiteSpaceCharacter; index++) {
    if (characterIsWhitespace(parserState.lineAccumulator.charAt(index))) {
      continue
    }

    conditionFromColumn = index
    break
  }

  if (foundWhen && conditionFromColumn === -1) {
    return false
  }

  const label = tryParseIdentifier(parserState, labelFromColumn, labelToColumn)

  if (label === null) {
    return false
  }

  let conditionAndIdentifiers: null | readonly [Condition, readonly Identifier[]] = null

  if (foundWhen) {
    // TODO: Is this ok (might have excess spaces at end)?  Should we be looking for last non white space ourselves?

    conditionAndIdentifiers = tryParseCondition(parserState, conditionFromColumn)

    if (conditionAndIdentifiers === null) {
      return false
    }
  }

  addIdentifierToIndex(parserState, label, 'label', 'reference')

  if (conditionAndIdentifiers !== null) {
    addIdentifierListToIndex(parserState, conditionAndIdentifiers[1], 'flag', 'implicitDeclaration')
  }

  if (checkReachable(parserState)) {
    const previousInstruction =
    parserState.instructions.length > 0
      ? parserState.instructions[parserState.instructions.length - 1]
      : undefined

    if (
      previousInstruction !== undefined &&
      previousInstruction.type === 'label' &&
      conditionAndIdentifiers === null
    ) {
      parserState.warnings.push({
        type: 'emptyLabel',
        line: previousInstruction.line,
        label: previousInstruction.label
      })
    }

    checkIdentifierConsistency(parserState, 'label', label)

    parserState.instructions.push({
      type: 'jump',
      line: parserState.line,
      label,
      instructionIndex: -1,
      condition: conditionAndIdentifiers === null ? null : conditionAndIdentifiers[0]
    })

    if (conditionAndIdentifiers === null) {
      parserState.reachability = 'firstUnreachable'
    } else {
      checkConsistencyOfFlagIdentifiersInCondition(parserState, conditionAndIdentifiers[0])
    }
  }

  return true
}
