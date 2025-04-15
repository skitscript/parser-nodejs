import type { Condition } from '../../Condition'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { characterIsE } from '../characterIsE.js'
import { characterIsH } from '../characterIsH.js'
import { characterIsJ } from '../characterIsJ.js'
import { characterIsM } from '../characterIsM.js'
import { characterIsN } from '../characterIsN.js'
import { characterIsO } from '../characterIsO.js'
import { characterIsP } from '../characterIsP.js'
import { characterIsT } from '../characterIsT.js'
import { characterIsU } from '../characterIsU.js'
import { characterIsW } from '../characterIsW.js'
import { characterIsWhitespace } from '../characterIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from '../tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'
import { tryParseCondition } from './tryParseCondition.js'

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
      return false
    }

    if (!characterIsO(parserState.lineAccumulator.charAt(index + 1))) {
      return false
    }

    if (!characterIsWhitespace(parserState.lineAccumulator.charAt(index + 2))) {
      return false
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

  const label = tryParseIdentifier(parserState, labelFromColumn, labelToColumn, 'label', 'reference', newIdentifierInstances, newWarnings, newIdentifiers)

  if (label === null) {
    return false
  }

  let condition: null | Condition = null

  if (foundWhen) {
    condition = tryParseCondition(parserState, conditionFromColumn, newIdentifierInstances, newWarnings, newIdentifiers)

    if (condition === null) {
      return false
    }
  }

  parserState.identifierInstances.push(...newIdentifierInstances)

  if (checkReachable(parserState, newWarnings, newIdentifiers)) {
    const previousInstruction =
    parserState.instructions.length > 0
      ? parserState.instructions[parserState.instructions.length - 1]
      : undefined

    if (
      previousInstruction !== undefined &&
      previousInstruction.type === 'label' &&
      condition === null
    ) {
      parserState.warnings.push({
        type: 'emptyLabel',
        line: previousInstruction.line,
        label: previousInstruction.label
      })
    }

    parserState.instructions.push({
      type: 'jump',
      line: parserState.line,
      label,
      instructionIndex: -1,
      condition
    })

    if (condition === null) {
      parserState.reachability = 'firstUnreachable'
    }
  }

  return true
}
