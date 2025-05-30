import type { Condition } from '../../Condition'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsE } from './codepointIsE.js'
import { codepointIsH } from './codepointIsH.js'
import { codepointIsJ } from './codepointIsJ.js'
import { codepointIsM } from './codepointIsM.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsO } from './codepointIsO.js'
import { codepointIsP } from './codepointIsP.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsU } from './codepointIsU.js'
import { codepointIsW } from './codepointIsW.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { checkReachable } from './checkReachable.js'
import { tryParseCondition } from './tryParseCondition.js'

export const tryParseJump = (parserState: ParserState): boolean => {
  if (parserState.indexOfLastNonWhiteSpaceCharacter < 8) {
    return false
  }

  if (!codepointIsJ(parserState.lineAccumulator.charAt(0))) {
    return false
  }

  if (!codepointIsU(parserState.lineAccumulator.charAt(1))) {
    return false
  }

  if (!codepointIsM(parserState.lineAccumulator.charAt(2))) {
    return false
  }

  if (!codepointIsP(parserState.lineAccumulator.charAt(3))) {
    return false
  }

  if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(4))) {
    return false
  }

  let foundTo = false
  let index = 5

  for (; index < parserState.indexOfLastNonWhiteSpaceCharacter - 2; index++) {
    const character = parserState.lineAccumulator.charAt(index)

    if (codepointIsWhitespace(character)) {
      continue
    }

    if (!codepointIsT(character)) {
      return false
    }

    if (!codepointIsO(parserState.lineAccumulator.charAt(index + 1))) {
      return false
    }

    if (!codepointIsWhitespace(parserState.lineAccumulator.charAt(index + 2))) {
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

    if (codepointIsWhitespace(character)) {
      if (index + 6 < parserState.indexOfLastNonWhiteSpaceCharacter) {
        if (codepointIsW(parserState.lineAccumulator.charAt(index + 1))) {
          if (codepointIsH(parserState.lineAccumulator.charAt(index + 2))) {
            if (codepointIsE(parserState.lineAccumulator.charAt(index + 3))) {
              if (codepointIsN(parserState.lineAccumulator.charAt(index + 4))) {
                if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index + 5))) {
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
    if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index))) {
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
    entry_animation: {},
    exit_animation: {},
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

  parserState.identifier_instances.push(...newIdentifierInstances)

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
        type: 'empty_label',
        line: previousInstruction.line,
        label: previousInstruction.label
      })
    }

    parserState.instructions.push({
      type: 'jump',
      line: parserState.line,
      label,
      instruction_index: -1,
      condition
    })

    if (condition === null) {
      parserState.reachability = 'first_unreachable'
    }
  }

  return true
}
