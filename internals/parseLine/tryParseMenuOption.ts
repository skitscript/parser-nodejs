import type { Condition } from '../../Condition'
import type { IdentifierInstance } from '../../IdentifierInstance'
import type { IdentifierType } from '../../IdentifierType'
import type { Warning } from '../../Warning'
import { codepointIsA } from './codepointIsA.js'
import { codepointIsD } from './codepointIsD.js'
import { codepointIsE } from './codepointIsE.js'
import { codepointIsGreaterThan } from './codepointIsGreaterThan.js'
import { codepointIsH } from './codepointIsH.js'
import { codepointIsL } from './codepointIsL.js'
import { codepointIsN } from './codepointIsN.js'
import { codepointIsO } from './codepointIsO.js'
import { codepointIsS } from './codepointIsS.js'
import { codepointIsT } from './codepointIsT.js'
import { codepointIsW } from './codepointIsW.js'
import { codepointIsWhitespace } from '../codepointIsWhitespace.js'
import type { LocalIdentifierInstance } from '../LocalIdentifierInstance'
import { parseFormatted } from './parseFormatted.js'
import type { ParserState } from '../ParserState'
import { tryParseIdentifier } from './tryParseIdentifier.js'
import { tryParseCondition } from './tryParseCondition.js'

const isLeads = (parserState: ParserState, index: number): boolean => {
  if (index >= 7) {
    if (codepointIsS(parserState.lineAccumulator.charAt(index - 1))) {
      if (codepointIsD(parserState.lineAccumulator.charAt(index - 2))) {
        if (codepointIsA(parserState.lineAccumulator.charAt(index - 3))) {
          if (codepointIsE(parserState.lineAccumulator.charAt(index - 4))) {
            if (codepointIsL(parserState.lineAccumulator.charAt(index - 5))) {
              if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index - 6))) {
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
    if (codepointIsO(parserState.lineAccumulator.charAt(index - 1))) {
      if (codepointIsT(parserState.lineAccumulator.charAt(index - 2))) {
        if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index - 3))) {
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
    if (codepointIsN(parserState.lineAccumulator.charAt(index - 1))) {
      if (codepointIsE(parserState.lineAccumulator.charAt(index - 2))) {
        if (codepointIsH(parserState.lineAccumulator.charAt(index - 3))) {
          if (codepointIsW(parserState.lineAccumulator.charAt(index - 4))) {
            if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index - 5))) {
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

// TODO: Slight rethink for these parsers, track whether we're following a word boundary instead.

export const tryParseMenuOption = (parserState: ParserState): boolean => {
  if (!codepointIsGreaterThan(parserState.lineAccumulator.charAt(0))) {
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
    if (codepointIsWhitespace(parserState.lineAccumulator.charAt(index))) {
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

  const label = tryParseIdentifier(parserState, labelFrom, labelTo, 'label', 'reference', newIdentifierInstances, newWarnings, newIdentifiers)

  if (label === null) {
    return false
  }

  let condition: null | Condition

  if (conditionFrom === -1) {
    condition = null
  } else {
    condition = tryParseCondition(parserState, conditionFrom, newIdentifierInstances, newWarnings, newIdentifiers)

    if (condition === null) {
      return false
    }
  }

  const content = parseFormatted(parserState, contentFrom, contentTo)

  if (content === null) {
    return true
  }

  parserState.identifier_instances.push(...newIdentifierInstances)

  if (parserState.reachability !== 'unreachable') {
    parserState.warnings.push(...newWarnings)

    for (const identifierType in newIdentifiers) {
      const identifiersOfType = parserState.identifiers[identifierType as IdentifierType]
      const newIdentifiersOfType = newIdentifiers[identifierType as IdentifierType]

      for (const key in newIdentifiersOfType) {
        identifiersOfType[key] = newIdentifiersOfType[key] as LocalIdentifierInstance
      }
    }

    parserState.instructions.push(
      {
        type: 'menu_option',
        line: parserState.line,
        content,
        label,
        instruction_index: -1,
        condition
      }
    )

    if (condition === null) {
      parserState.reachability = 'will_become_unreachable_at_end_of_current_menu'
    }
  }

  return true
}
